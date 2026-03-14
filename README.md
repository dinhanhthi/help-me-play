<p align="center">
  <img src="public/logo.svg" alt="Coding Friend Logo" width="100" />
</p>

<h1 align="center">Help Me Play</h1>

<p align="center">
  Visual guides for Nintendo Switch games. Learn character combos with interactive Joy-Con button visualizations alongside video/GIF demonstrations.
</p>

<p align="center">
  <a href="https://hmp.dinhanhthi.com">Website</a> ·
  <a href="https://github.com/dinhanhthi/help-me-play/issues">Report Bug</a>
</p>

## Features

- Interactive Joy-Con controller visualization with button highlighting and combo animation
- Side-by-side layout: combo buttons (left) + video/GIF demo (right)
- Two controller modes: Handheld Mode and Single Joy-Con Mode
- Embedded media support: YouTube, Vimeo, Dailymotion, Giphy, Cloudinary, direct URLs
- Bilingual support (English + Vietnamese) with locale switcher
- JSON-driven data — easy to add new games, characters, and moves
- Static site — fast, no backend required
- Responsive design for mobile and desktop

## Supported Games

- Super Smash Bros. Ultimate

## Tech Stack

- [Next.js](https://nextjs.org/) 16 (App Router, static export)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Vercel](https://vercel.com/) for deployment

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
```

The static site is generated in the `out/` directory.

### Lint & Format

```bash
npm run lint        # Run ESLint
npm run format      # Format with Prettier
npm run format:check # Check formatting without writing
```

## Project Structure

```
app/
  page.tsx                                    # Home page (game grid)
  games/[gameSlug]/
    page.tsx                                  # Game page (characters + tips)
    characters/[characterSlug]/
      page.tsx                                # Character page (combos + videos)
components/
  joy-con/     # Controller visualization (SVG shells, button highlights, combo animation)
  layout/      # Header, Footer, GameCard, CharacterCard
  media/       # MediaEmbed (YouTube, Vimeo, GIF, etc.)
  ui/          # Tabs, ModeToggle, LocaleSwitcher
lib/
  types.ts           # TypeScript interfaces
  data.ts            # JSON data loading utilities
  embed.ts           # Media URL parser
  button-positions.ts # Button coordinate maps
  button-labels.ts   # Button metadata
  i18n/              # Locale context, en.json, vi.json
data/
  games.json         # List of all games
  buttons.json       # Switch button definitions
  smash-bros/
    meta.json         # Game metadata + general tips
    characters.json   # Character list
    moves/
      mario.json      # Mario's moves and combos
      link.json       # Link's moves and combos
      pikachu.json    # Pikachu's moves and combos
```

## Localization

The site supports **English** (`en`) and **Vietnamese** (`vi`). When adding or editing text in data files, always provide both languages:

```json
{
  "name": { "en": "Jab", "vi": "Đấm liên hoàn" },
  "description": { "en": "A quick punch combo", "vi": "Combo đấm nhanh" }
}
```

- **Move data** (`data/*/moves/*.json`): `name` and `description` fields use `LocalizedString` — provide both `en` and `vi` values.
- **UI strings** (`lib/i18n/en.json`, `lib/i18n/vi.json`): Keep both files in sync when adding or changing UI text.

## Contributing

Contributions are welcome! See the [Contributing Guide](CONTRIBUTING.md) for detailed instructions on how to add games, characters, and moves.

## License

MIT
