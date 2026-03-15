# Contributing

Contributions are welcome! You can help by adding new games, characters, moves, or improving existing data. **No coding required** — just edit JSON files.

## How to contribute

1. Fork this repository
2. Create a branch: `git checkout -b add-<game>-<character>`
3. Make your changes (see guides below)
4. Run `npm run build` to verify your changes work
5. Commit with a descriptive message: `git commit -m "feat: add Kirby to Smash Bros"`
6. Open a Pull Request

## Data structure overview

```
data/
  games.json                    # List of all games
  buttons.json                  # Switch button definitions (handheld + single-joycon modes)
  <game-slug>/
    meta.json                   # Game metadata + tips
    characters.json             # Character roster
    moves/<character-slug>.json # Moves with localized names/descriptions
```

## Add a new character to an existing game

1. Add an entry to `data/<game-slug>/characters.json`:

```json
{
  "slug": "kirby",
  "name": "Kirby",
  "portrait": "https://example.com/kirby.png",
  "description": "A lightweight puffball who can copy opponents' abilities.",
  "tags": ["lightweight", "beginner-friendly"]
}
```

| Field | Required | Description |
|-------|----------|-------------|
| `slug` | Yes | Unique identifier (kebab-case) |
| `name` | Yes | Display name |
| `portrait` | No | Any public image URL |
| `description` | No | Short character description |
| `tags` | No | Array of descriptive tags |

2. Create `data/<game-slug>/moves/kirby.json` with the character's moves (see [Move JSON format](#move-json-format) below).

3. (Optional) Add a portrait by setting `portrait` to any public image URL. The maintainer will run the migration script to re-host it before merging.

## Add a new game

1. Add an entry to `data/games.json`:

```json
{
  "slug": "mario-kart",
  "title": "Mario Kart 8 Deluxe",
  "description": "Race against friends with items and drifting techniques.",
  "coverImage": "https://example.com/mario-kart.jpg"
}
```

2. Create the game data directory: `data/mario-kart/`

3. Create `data/mario-kart/meta.json`:

```json
{
  "slug": "mario-kart",
  "title": "Mario Kart 8 Deluxe",
  "description": "Master drifting, items, and shortcuts.",
  "coverImage": "https://example.com/mario-kart.jpg",
  "tips": [
    "Hold the drift button (ZR) and steer to charge a mini-turbo.",
    "Press the item button right before getting hit to use a defensive item."
  ]
}
```

4. Create `data/mario-kart/characters.json` with the character roster.

5. Create `data/mario-kart/moves/<character-slug>.json` for each character.

## Move JSON format

Each move file is a JSON array of move objects. Names and descriptions support localization:

```json
[
  {
    "id": "fireball",
    "name": { "en": "Fireball", "vi": "Cầu lửa" },
    "description": { "en": "A bouncing fireball that controls space.", "vi": "Quả cầu lửa nảy kiểm soát không gian." },
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

### Field reference

| Field | Required | Description |
|-------|----------|-------------|
| `id` | Yes | Unique identifier (kebab-case) |
| `name` | Yes | Display name — `string` or `{ "en": "...", "vi": "..." }` |
| `description` | No | Brief explanation — `string` or `{ "en": "...", "vi": "..." }` |
| `category` | Yes | One of: `ground`, `special`, `smash`, `tilt`, `aerial`, `throw`, `other` |
| `combos` | Yes | Button combos per controller mode (see below) |
| `mediaUrl` | Yes | URL to video or GIF demonstration |
| `mediaType` | No | Override auto-detection: `video`, `gif`, or `image` |

### Combo step format

Each combo is an array of steps (buttons pressed in sequence):

```json
{ "buttons": ["left-stick", "b"], "direction": "up", "inputType": "Tap", "duration": 1000 }
```

| Field | Required | Description |
|-------|----------|-------------|
| `buttons` | Yes | Array of button IDs pressed simultaneously |
| `direction` | No | Stick direction: `up`, `down`, `left`, `right` |
| `inputType` | No | How to press all buttons in this step: `Tap`, `Hold`, `Smash`, `Tilt` |
| `buttonInputTypes` | No | Per-button overrides when buttons in the same step have different input types (see below) |
| `duration` | No | How long to hold (ms), default: 1000 |

#### Per-button input types

Use `buttonInputTypes` when buttons in the same step are pressed differently. It overrides `inputType` for specific buttons; any button not listed falls back to `inputType`.

```json
{ "buttons": ["l", "a"], "buttonInputTypes": { "l": "Hold", "a": "Tap" } }
```

| Scenario | How to write it |
|----------|-----------------|
| All buttons same | Use `inputType` only |
| All buttons different | Use `buttonInputTypes` only |
| One exception, rest the same | Use both: `inputType` as default, `buttonInputTypes` for the exception |

### Available button IDs

**Handheld mode:** `a`, `b`, `x`, `y`, `l`, `r`, `zl`, `zr`, `plus`, `minus`, `home`, `capture`, `left-stick`, `right-stick`, `dpad-up`, `dpad-down`, `dpad-left`, `dpad-right`

**Single Joy-Con mode:** `a`, `b`, `x`, `y`, `sl`, `sr`, `stick`

### Supported media URLs

| Provider | Example URL |
|----------|-------------|
| YouTube | `https://www.youtube.com/watch?v=dQw4w9WgXcQ` |
| YouTube Shorts | `https://youtube.com/shorts/VIDEO_ID` |
| Vimeo | `https://vimeo.com/123456789` |
| Dailymotion | `https://www.dailymotion.com/video/x7tgad0` |
| Giphy | `https://giphy.com/gifs/SLUG-ID` |
| Cloudinary | `https://res.cloudinary.com/CLOUD/image/upload/FILE` |
| Direct | Any URL ending in `.mp4`, `.webm`, `.gif`, `.jpg`, `.png`, `.webp` |

## Slug naming convention

Slugs must contain only **lowercase letters, numbers, and hyphens**. Examples:
- Game: `smash-bros`, `mario-kart`, `zelda-totk`
- Character: `mario`, `donkey-kong`, `mr-game-and-watch`
- Move: `forward-smash`, `up-special`, `neutral-air`
