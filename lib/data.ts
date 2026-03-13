import fs from "fs";
import path from "path";
import type { Game, GameMeta, Character, Move, ButtonDefinition } from "./types";

const SAFE_SLUG = /^[a-z0-9-]+$/;

function assertSafeSlug(slug: string): void {
  if (!SAFE_SLUG.test(slug)) {
    throw new Error(
      `Invalid slug: "${slug}". Slugs must only contain lowercase letters, numbers, and hyphens.`,
    );
  }
}

function dataPath(...segments: string[]): string {
  return path.join(process.cwd(), "data", ...segments);
}

function readJson<T>(filePath: string): T {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to read data file "${filePath}": ${message}`);
  }
}

export function getAllGames(): Game[] {
  return readJson<Game[]>(dataPath("games.json"));
}

export function getGameMeta(gameSlug: string): GameMeta {
  assertSafeSlug(gameSlug);
  return readJson<GameMeta>(dataPath(gameSlug, "meta.json"));
}

export function getCharacters(gameSlug: string): Character[] {
  assertSafeSlug(gameSlug);
  return readJson<Character[]>(dataPath(gameSlug, "characters.json"));
}

export function getCharacter(gameSlug: string, characterSlug: string): Character | undefined {
  const characters = getCharacters(gameSlug);
  return characters.find((c) => c.slug === characterSlug);
}

export function getMoves(gameSlug: string, characterSlug: string): Move[] {
  assertSafeSlug(gameSlug);
  assertSafeSlug(characterSlug);
  return readJson<Move[]>(dataPath(gameSlug, "moves", `${characterSlug}.json`));
}

export function getButtonDefinitions(): ButtonDefinition[] {
  const data = readJson<{ buttons: ButtonDefinition[] }>(dataPath("buttons.json"));
  return data.buttons;
}
