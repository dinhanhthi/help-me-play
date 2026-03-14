<p align="center">
  <img src="assets/logo.svg" alt="Coding Friend Logo" width="100" />
</p>

<h1 align="center">Help Me Play</h1>

<p align="center">
  Visual guides for Nintendo Switch games. Learn character combos with interactive Joy-Con button visualizations alongside video/GIF demonstrations.
</p>

<p align="center">
  <a href="https://hmplay.dinhanhthi.com">Website</a> ·
  <a href="https://hmplay.dinhanhthi.com/changelog">Changelog</a> ·
  <a href="https://github.com/dinhanhthi/help-me-play/issues">Report Bug</a>
</p>

Visual guides for Nintendo Switch games. Learn character combos with interactive Joy-Con button visualizations alongside video/GIF demonstrations.

## Features

- Interactive Joy-Con controller visualization with button highlighting and combo animation
- Side-by-side layout: combo buttons (left) + video/GIF demo (right)
- Two controller modes: Handheld Mode and Single Joy-Con Mode
- Embedded media support: YouTube, Vimeo, Dailymotion, Giphy, Cloudinary, direct URLs
- JSON-driven data — easy to add new games, characters, and moves
- Static site — fast, no backend required
- Responsive design for mobile and desktop

## Supported Games

- Super Smash Bros. Ultimate (Mario, Link, Pikachu)

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
  ui/          # Tabs, ModeToggle
lib/
  types.ts           # TypeScript interfaces
  data.ts            # JSON data loading utilities
  embed.ts           # Media URL parser
  button-positions.ts # Button coordinate maps
  button-labels.ts   # Button metadata
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

## Contributing

Contributions are welcome! You can help by adding new games, characters, moves, or improving existing data. **No coding required** — just edit JSON files.

### How to contribute

1. Fork this repository
2. Create a branch: `git checkout -b add-<game>-<character>`
3. Make your changes (see guides below)
4. Run `npm run build` to verify your changes work
5. Commit with a descriptive message: `git commit -m "feat: add Kirby to Smash Bros"`
6. Open a Pull Request

### Add a new character to an existing game

1. Add an entry to `data/<game-slug>/characters.json`:

```json
{
  "slug": "kirby",
  "name": "Kirby",
  "description": "A lightweight puffball who can copy opponents' abilities.",
  "tags": ["lightweight", "beginner-friendly"]
}
```

2. Create `data/<game-slug>/moves/kirby.json` with the character's moves (see [Move JSON format](#move-json-format) below).

3. (Optional) Add a portrait image at `public/images/characters/<game-slug>/kirby.png` and set the `portrait` field in characters.json.

### Add a new game

1. Add an entry to `data/games.json`:

```json
{
  "slug": "mario-kart",
  "title": "Mario Kart 8 Deluxe",
  "description": "Race against friends with items and drifting techniques.",
  "coverImage": "/images/games/mario-kart.jpg"
}
```

2. Create the game data directory: `data/mario-kart/`

3. Create `data/mario-kart/meta.json`:

```json
{
  "slug": "mario-kart",
  "title": "Mario Kart 8 Deluxe",
  "description": "Master drifting, items, and shortcuts.",
  "coverImage": "/images/games/mario-kart.jpg",
  "tips": [
    "Hold the drift button (ZR) and steer to charge a mini-turbo.",
    "Press the item button right before getting hit to use a defensive item."
  ]
}
```

4. Create `data/mario-kart/characters.json` with the character/racer list.

5. Create `data/mario-kart/moves/<character-slug>.json` for each character.

### Move JSON format

Each move file is a JSON array of move objects:

```json
[
  {
    "id": "fireball",
    "name": "Fireball",
    "description": "A bouncing fireball that controls space.",
    "category": "special",
    "combos": {
      "handheld": [
        { "buttons": ["b"], "inputType": "Tap" }
      ],
      "single-joycon": [
        { "buttons": ["b"], "inputType": "Tap" }
      ]
    },
    "mediaUrl": "https://www.youtube.com/watch?v=VIDEO_ID"
  }
]
```

#### Field reference

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier (kebab-case) |
| `name` | Yes | Display name of the move |
| `description` | No | Brief explanation of the move |
| `category` | Yes | One of: `special`, `smash`, `tilt`, `throw`, `other` |
| `combos` | Yes | Button combos per controller mode (see below) |
| `mediaUrl` | Yes | URL to video or GIF demonstration |
| `mediaType` | No | Override auto-detection: `video`, `gif`, or `image` |

#### Combo step format

Each combo is an array of steps (buttons pressed in sequence):

```json
{ "buttons": ["left-stick", "b"], "direction": "up", "inputType": "Tap", "duration": 1000 }
```

| Field | Required | Description |
|-------|----------|-------------|
| `buttons` | Yes | Array of button IDs pressed simultaneously |
| `direction` | No | Stick direction: `up`, `down`, `left`, `right` |
| `inputType` | No | How to press: `Tap`, `Hold`, `Smash`, `Mash` |
| `duration` | No | How long to hold (ms), default: 1000 |

#### Available button IDs

**Handheld mode:** `a`, `b`, `x`, `y`, `l`, `r`, `zl`, `zr`, `plus`, `minus`, `home`, `capture`, `left-stick`, `right-stick`, `dpad-up`, `dpad-down`, `dpad-left`, `dpad-right`

**Single Joy-Con mode:** `a`, `b`, `x`, `y`, `sl`, `sr`, `stick`

#### Supported media URLs

| Provider | Example URL |
|----------|-------------|
| YouTube | `https://www.youtube.com/watch?v=dQw4w9WgXcQ` |
| YouTube Shorts | `https://youtube.com/shorts/VIDEO_ID` |
| Vimeo | `https://vimeo.com/123456789` |
| Dailymotion | `https://www.dailymotion.com/video/x7tgad0` |
| Giphy | `https://giphy.com/gifs/SLUG-ID` |
| Cloudinary | `https://res.cloudinary.com/CLOUD/image/upload/FILE` |
| Direct | Any URL ending in `.mp4`, `.webm`, `.gif`, `.jpg`, `.png`, `.webp` |

### Slug naming convention

Slugs must contain only **lowercase letters, numbers, and hyphens**. Examples:
- Game: `smash-bros`, `mario-kart`, `zelda-totk`
- Character: `mario`, `donkey-kong`, `mr-game-and-watch`
- Move: `forward-smash`, `up-special`, `neutral-air`

## License

MIT
