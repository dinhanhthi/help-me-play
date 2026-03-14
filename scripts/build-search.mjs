/**
 * Build search index using Pagefind Node API.
 * Indexes games and characters from JSON data as custom records.
 * Run after `next build` to generate the search index in `out/pagefind/`.
 */
import * as pagefind from "pagefind";
import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

async function buildSearchIndex() {
  const { index } = await pagefind.createIndex({});

  if (!index) {
    console.error("Failed to create Pagefind index");
    process.exit(1);
  }

  const games = readJson(path.join(DATA_DIR, "games.json"));
  let totalRecords = 0;

  for (const game of games) {
    // Index game
    await index.addCustomRecord({
      url: `/games/${game.slug}/`,
      content: [game.title, game.description].filter(Boolean).join(". "),
      language: "en",
      meta: {
        title: game.title,
        description: game.description || "",
        image: game.coverImage || "",
        type: "game",
      },
      filters: {
        type: ["game"],
      },
    });
    totalRecords++;

    // Index characters for this game
    const charsPath = path.join(DATA_DIR, game.slug, "characters.json");
    if (!fs.existsSync(charsPath)) continue;

    const characters = readJson(charsPath);
    for (const char of characters) {
      const tags = (char.tags || []).join(", ");
      await index.addCustomRecord({
        url: `/games/${game.slug}/characters/${char.slug}/`,
        content: [char.name, char.description, tags].filter(Boolean).join(". "),
        language: "en",
        meta: {
          title: char.name,
          description: char.description || "",
          image: char.portrait || "",
          type: "character",
          game: game.title,
          gameSlug: game.slug,
          tags: tags,
        },
        filters: {
          type: ["character"],
          game: [game.slug],
        },
      });
      totalRecords++;
    }
  }

  // Write index to the static output directory
  const outputPath = path.join(process.cwd(), "out", "pagefind");
  await index.writeFiles({ outputPath });
  console.log(`Search index built: ${totalRecords} records → ${outputPath}`);

  await pagefind.close();
}

buildSearchIndex().catch((err) => {
  console.error("Failed to build search index:", err);
  process.exit(1);
});
