# CLAUDE.md

## Project Overview

**Help Me Play** — A static website providing visual combo guides for Nintendo Switch games. Users browse games, select characters, and view move-by-move guides with an interactive Joy-Con controller visualization (left panel) and embedded video/GIF demonstrations (right panel).

## Tech Stack

- **Framework**: Next.js 16 (App Router, static export `output: "export"`)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS v4 (inline `@theme` directive, custom CSS variables in `globals.css`)
- **Icons**: lucide-react
- **Fonts**: Geist Sans (body + display), Geist Mono (monospace) — via `geist` package v1.7+ (Vietnamese support)
- **i18n**: Custom context-based (English + Vietnamese), localStorage persistence
- **Deployment**: Vercel (static hosting)

## Commands

```bash
npm run dev          # Dev server at localhost:3000
npm run build        # Static export to out/
npm run lint         # ESLint (v9 flat config)
npm run format       # Prettier format all files
npm run format:check # Check formatting only
```

## Project Structure

```
app/                           # Next.js App Router pages
  layout.tsx                   # Root layout (I18nProvider, Header, Footer)
  page.tsx → HomeClient.tsx    # Home page (game grid)
  games/[gameSlug]/
    page.tsx → GamePageClient.tsx       # Game page (tabs: characters/tips)
    characters/[characterSlug]/
      page.tsx → CharacterPageClient.tsx # Character page (combos + media)

components/
  joy-con/    # Controller visualization (ComboSequence, ControllerShell, JoyCon*)
  layout/     # Header, Footer, GameCard, CharacterCard
  media/      # MediaEmbed (YouTube, Vimeo, Giphy, etc.)
  ui/         # Tabs, ModeToggle, LocaleSwitcher

lib/
  types.ts           # Core interfaces (Game, Character, Move, ComboStep, etc.)
  data.ts            # JSON loaders with slug validation (SAFE_SLUG regex)
  embed.ts           # Media URL parser (parseMediaUrl)
  button-labels.ts   # Button metadata
  i18n/              # Locale types, context provider, en.json, vi.json

data/
  games.json         # All games
  buttons.json       # Switch button definitions (handheld + single-joycon modes)
  {gameSlug}/
    meta.json         # Game metadata + tips
    characters.json   # Character roster
    moves/{char}.json # Moves with localized names/descriptions
```

## Architecture Patterns

- **Server Components** (page.tsx): Read JSON at build time via `fs.readFileSync`, pass props to client components
- **Client Components** (*Client.tsx): Handle interactivity (tabs, combo animation, mode toggle)
- **Static Generation**: All routes use `generateStaticParams()` for SSG — no runtime server
- **Data-driven**: All content in JSON under `data/` — no code changes needed to add content
- **Localized strings**: `LocalizedString = string | Record<string, string>` with English fallback
- **Slug validation**: All slugs validated against `/^[a-z0-9-]+$/` to prevent path traversal

## Code Style

- **Prettier**: 2 spaces, double quotes, trailing commas, semicolons, 100 char width
- **ESLint**: Next.js Core Web Vitals + TypeScript rules + eslint-config-prettier
- **Components**: PascalCase files, client components suffixed with `Client.tsx`
- **Utilities**: camelCase files in `lib/`
- **Path alias**: `@/*` maps to project root

## Data Format

Moves support localized strings:
```json
{
  "name": { "en": "Jab", "vi": "Đấm liên hoàn" },
  "combos": {
    "handheld": [{ "buttons": ["a"], "inputType": "Tap" }],
    "single-joycon": [{ "buttons": ["a"], "inputType": "Tap" }]
  }
}
```

## Current State

- 1 game: Super Smash Bros. Ultimate
- 3 characters: Mario (31 moves, fully localized), Link (7 moves), Pikachu (6 moves)
- No tests or CI/CD configured
- Supported media: YouTube, Vimeo, Dailymotion, Giphy, Cloudinary, direct URLs
