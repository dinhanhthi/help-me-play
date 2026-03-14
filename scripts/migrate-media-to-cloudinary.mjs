#!/usr/bin/env node

/**
 * Scans all move JSON files in data/, downloads GIF/image media (not videos),
 * uploads them to Cloudinary, and replaces mediaUrl with the Cloudinary URL.
 * The original URL is preserved in a new "sourceUrl" field.
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

function resourceTypeForExt() {
  return "image"; // gif, png, jpg, webp are all "image" in Cloudinary
}

async function main() {
  if (!DRY_RUN && (!CLOUD_NAME || !API_KEY || !API_SECRET)) {
    console.error(
      "Error: CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET required",
    );
    process.exit(1);
  }

  const moveFiles = findMoveFiles(DATA_DIR);
  console.log(`Found ${moveFiles.length} move file(s)`);

  let totalMigrated = 0;
  let totalSkipped = 0;
  let totalFailed = 0;

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
      if (shouldSkip(move.mediaUrl)) {
        totalSkipped++;
        continue;
      }
      // Already migrated (has sourceUrl and mediaUrl points to cloudinary)
      if (move.sourceUrl && move.mediaUrl.includes("res.cloudinary.com")) {
        totalSkipped++;
        continue;
      }

      const originalUrl = move.mediaUrl;
      // Build a clean public_id from file path + move id
      const gamePart = relPath.split("/")[1] || "unknown"; // e.g. "smash-bros"
      const charPart = path.basename(file, ".json"); // e.g. "mario"
      const publicId = `${gamePart}/${charPart}/${move.id}`;

      if (DRY_RUN) {
        console.log(`  [DRY RUN] Would migrate: ${move.id} → ${originalUrl}`);
        console.log(`            Public ID: help-me-play/${publicId}`);
        totalMigrated++;
        continue;
      }

      let tempPath;
      try {
        console.log(`  Downloading: ${originalUrl}`);
        const downloaded = await downloadFile(originalUrl);
        tempPath = downloaded.tempPath;

        const resourceType = resourceTypeForExt();
        console.log(`  Uploading to Cloudinary as ${resourceType}: ${publicId}`);
        const cloudinaryUrl = await uploadToCloudinary(tempPath, publicId, resourceType);

        move.sourceUrl = originalUrl;
        move.mediaUrl = cloudinaryUrl;
        modified = true;
        totalMigrated++;
        console.log(`  ✓ ${move.id}: ${cloudinaryUrl}`);
      } catch (err) {
        console.error(`  ✗ Failed ${move.id}: ${err.message}`);
        totalFailed++;
      } finally {
        if (tempPath && fs.existsSync(tempPath)) {
          fs.unlinkSync(tempPath);
        }
      }
    }

    if (modified) {
      fs.writeFileSync(file, JSON.stringify(content, null, 2) + "\n");
      console.log(`  Updated ${relPath}`);
    }
  }

  console.log(
    `\nDone! Migrated: ${totalMigrated}, Skipped: ${totalSkipped}, Failed: ${totalFailed}`,
  );
  if (totalFailed > 0) process.exit(1);
}

main();
