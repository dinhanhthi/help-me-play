#!/usr/bin/env node

/**
 * Migrates media assets to Cloudinary:
 *
 *   1. coverImage in data/games.json         → help-me-play/games/<slug>
 *   2. portrait  in data/<game>/characters.json → help-me-play/<game>/characters/<slug>
 *   3. mediaUrl  in data/<game>/moves/*.json  → help-me-play/<game>/<char>/<moveId>
 *      (original URL preserved in "sourceUrl" field)
 *
 * Skips: YouTube, Vimeo, Dailymotion, direct video files (.mp4, .webm),
 *        and URLs already on Cloudinary.
 *
 * Required env vars:
 *   CLOUDINARY_CLOUD_NAME
 *   CLOUDINARY_API_KEY
 *   CLOUDINARY_API_SECRET
 *
 * Usage: node scripts/migrate-media-to-cloudinary.mjs [--dry-run]
 */

import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DATA_DIR = path.join(ROOT, "data");

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;
const DRY_RUN = process.argv.includes("--dry-run");

// Providers that should NOT be re-hosted (video platforms embedded via iframe)
const SKIP_PROVIDERS = new Set(["youtube.com", "youtu.be", "vimeo.com", "dailymotion.com"]);

// Only migrate these extensions (GIF + images)
const ALLOWED_EXTENSIONS = new Set([".gif", ".png", ".jpg", ".jpeg", ".webp"]);

function shouldSkip(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace("www.", "");
    // Skip video platforms and already-migrated Cloudinary URLs
    if (SKIP_PROVIDERS.has(hostname) || hostname.includes("res.cloudinary.com")) return true;
    // Skip video files (.mp4, .webm)
    const pathname = parsed.pathname.toLowerCase().split("?")[0];
    const ext = path.extname(pathname);
    if (ext && !ALLOWED_EXTENSIONS.has(ext)) return true;
    return false;
  } catch {
    return true;
  }
}

/**
 * Find all characters.json files under data/, one per game directory.
 * Returns [{ file, gameSlug }]
 */
function findCharacterFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const charFile = path.join(dir, entry.name, "characters.json");
    if (fs.existsSync(charFile)) {
      results.push({ file: charFile, gameSlug: entry.name });
    }
  }
  return results;
}

/**
 * Find all move JSON files recursively under data/
 */
function findMoveFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findMoveFiles(full));
    } else if (entry.name.endsWith(".json") && full.includes("/moves/")) {
      results.push(full);
    }
  }
  return results;
}

/**
 * Download a file to a temp path, return { tempPath, contentType }
 */
async function downloadFile(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (compatible; HelpMePlay-MediaMigrator/1.0; +https://github.com/dinhanhthi/help-me-play)",
    },
    redirect: "follow",
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = guessExtension(url, res.headers.get("content-type") || "");
  const hash = crypto.createHash("md5").update(url).digest("hex").slice(0, 8);
  const tempPath = path.join(ROOT, `.tmp-media-${hash}${ext}`);
  fs.writeFileSync(tempPath, buffer);
  return { tempPath, contentType: res.headers.get("content-type") || "" };
}

function guessExtension(url, contentType) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith(".gif")) return ".gif";
  if (pathname.endsWith(".png")) return ".png";
  if (pathname.endsWith(".jpg") || pathname.endsWith(".jpeg")) return ".jpg";
  if (pathname.endsWith(".webp")) return ".webp";
  // Fallback to content-type
  if (contentType.includes("gif")) return ".gif";
  if (contentType.includes("png")) return ".png";
  if (contentType.includes("jpeg") || contentType.includes("jpg")) return ".jpg";
  return ".gif"; // default for game move assets
}

const MAX_CLOUDINARY_BYTES = 10 * 1024 * 1024; // 10MB

/**
 * Compress a GIF file using gifsicle if it exceeds Cloudinary's size limit.
 * Tries progressively more aggressive lossy compression until it fits.
 * Returns the path to the (possibly compressed) file.
 */
function compressGifIfNeeded(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== ".gif") return filePath;

  const size = fs.statSync(filePath).size;
  if (size <= MAX_CLOUDINARY_BYTES) return filePath;

  // Check gifsicle is available
  const check = spawnSync("gifsicle", ["--version"], { stdio: "ignore" });
  if (check.error) {
    console.warn("  ⚠ gifsicle not found — skipping compression");
    return filePath;
  }

  const compressedPath = filePath.replace(/\.gif$/, "-compressed.gif");

  for (const lossy of [30, 60, 100, 150, 200]) {
    spawnSync(
      "gifsicle",
      ["-O3", `--lossy=${lossy}`, "--colors", "128", filePath, "-o", compressedPath],
      { stdio: "ignore" },
    );
    const newSize = fs.statSync(compressedPath).size;
    console.log(
      `  ↓ Compressed (lossy=${lossy}): ${(size / 1024 / 1024).toFixed(1)}MB → ${(newSize / 1024 / 1024).toFixed(1)}MB`,
    );
    if (newSize <= MAX_CLOUDINARY_BYTES) return compressedPath;
  }

  console.warn("  ⚠ Could not compress GIF below 10MB — upload may fail");
  return compressedPath;
}

/**
 * Upload a file to Cloudinary using the Upload API (unsigned is not needed — we use signed)
 */
async function uploadToCloudinary(filePath, publicId, resourceType) {
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = {
    folder: "help-me-play",
    public_id: publicId,
    timestamp: String(timestamp),
    overwrite: "true",
  };

  // Build signature string: key=value pairs sorted alphabetically, joined with &
  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map((k) => `${k}=${paramsToSign[k]}`)
    .join("&");
  const signature = crypto
    .createHash("sha1")
    .update(sortedParams + API_SECRET)
    .digest("hex");

  const formData = new FormData();
  const fileBuffer = fs.readFileSync(filePath);
  const blob = new Blob([fileBuffer]);
  formData.append("file", blob, path.basename(filePath));
  formData.append("api_key", API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", "help-me-play");
  formData.append("public_id", publicId);
  formData.append("overwrite", "true");

  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resourceType}/upload`;
  const res = await fetch(uploadUrl, { method: "POST", body: formData });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Cloudinary upload failed: ${res.status} ${body}`);
  }

  const data = await res.json();
  return data.secure_url;
}

async function migrateAsset(url, publicId, stats) {
  if (!url || shouldSkip(url)) {
    stats.skipped++;
    return null;
  }

  if (DRY_RUN) {
    console.log(`  [DRY RUN] Would migrate: ${url}`);
    console.log(`            Public ID: help-me-play/${publicId}`);
    stats.migrated++;
    return null;
  }

  let tempPath;
  try {
    console.log(`  Downloading: ${url}`);
    ({ tempPath } = await downloadFile(url));
    const uploadPath = compressGifIfNeeded(tempPath);
    console.log(`  Uploading: help-me-play/${publicId}`);
    const cloudinaryUrl = await uploadToCloudinary(uploadPath, publicId, "image");
    stats.migrated++;
    console.log(`  ✓ ${publicId}: ${cloudinaryUrl}`);
    return cloudinaryUrl;
  } catch (err) {
    console.error(`  ✗ Failed ${publicId}: ${err.message}`);
    stats.failed++;
    return null;
  } finally {
    if (tempPath && fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
    const compressedPath = tempPath?.replace(/\.gif$/, "-compressed.gif");
    if (compressedPath && compressedPath !== tempPath && fs.existsSync(compressedPath)) {
      fs.unlinkSync(compressedPath);
    }
  }
}

async function migrateGameCovers(stats) {
  const gamesFile = path.join(DATA_DIR, "games.json");
  const games = JSON.parse(fs.readFileSync(gamesFile, "utf-8"));
  if (!Array.isArray(games)) return;

  let modified = false;
  for (const game of games) {
    const newUrl = await migrateAsset(game.coverImage, `games/${game.slug}`, stats);
    if (newUrl) {
      game.coverImage = newUrl;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(gamesFile, JSON.stringify(games, null, 2) + "\n");
    console.log(`  Updated data/games.json`);
  }
}

async function migrateCharacterPortraits(stats) {
  const charFiles = findCharacterFiles(DATA_DIR);
  console.log(`Found ${charFiles.length} character file(s)`);

  for (const { file, gameSlug } of charFiles) {
    const characters = JSON.parse(fs.readFileSync(file, "utf-8"));
    if (!Array.isArray(characters)) continue;

    let modified = false;
    for (const char of characters) {
      const publicId = `${gameSlug}/characters/${char.slug}`;
      const newUrl = await migrateAsset(char.portrait, publicId, stats);
      if (newUrl) {
        char.portrait = newUrl;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(file, JSON.stringify(characters, null, 2) + "\n");
      console.log(`  Updated data/${gameSlug}/characters.json`);
    }
  }
}

async function migrateMoveMedia(stats) {
  const moveFiles = findMoveFiles(DATA_DIR);
  console.log(`Found ${moveFiles.length} move file(s)`);

  for (const file of moveFiles) {
    const relPath = path.relative(ROOT, file);
    const content = JSON.parse(fs.readFileSync(file, "utf-8"));

    if (!Array.isArray(content)) {
      console.log(`  Skipping ${relPath}: not an array`);
      continue;
    }

    let modified = false;

    for (const move of content) {
      if (!move.mediaUrl) continue;
      // Already migrated (has sourceUrl and mediaUrl points to Cloudinary)
      if (move.sourceUrl && move.mediaUrl.includes("res.cloudinary.com")) {
        stats.skipped++;
        continue;
      }

      const gamePart = relPath.split("/")[1] || "unknown"; // e.g. "smash-bros"
      const charPart = path.basename(file, ".json"); // e.g. "mario"
      const publicId = `${gamePart}/${charPart}/${move.id}`;
      const originalUrl = move.mediaUrl;

      const newUrl = await migrateAsset(originalUrl, publicId, stats);
      if (newUrl) {
        move.sourceUrl = originalUrl;
        move.mediaUrl = newUrl;
        modified = true;
      }
    }

    if (modified) {
      fs.writeFileSync(file, JSON.stringify(content, null, 2) + "\n");
      console.log(`  Updated ${relPath}`);
    }
  }
}

async function main() {
  if (!DRY_RUN && (!CLOUD_NAME || !API_KEY || !API_SECRET)) {
    console.error(
      "Error: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET required",
    );
    process.exit(1);
  }

  const stats = { migrated: 0, skipped: 0, failed: 0 };

  console.log("\n── Game covers ──────────────────────────────");
  await migrateGameCovers(stats);

  console.log("\n── Character portraits ──────────────────────");
  await migrateCharacterPortraits(stats);

  console.log("\n── Move media ───────────────────────────────");
  await migrateMoveMedia(stats);

  console.log(
    `\nDone! Migrated: ${stats.migrated}, Skipped: ${stats.skipped}, Failed: ${stats.failed}`,
  );
  if (stats.failed > 0) {
    console.warn(`\n⚠ ${stats.failed} asset(s) failed to migrate. Check logs above for details.`);
  }
}

main();
