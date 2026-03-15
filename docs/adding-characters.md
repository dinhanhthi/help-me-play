# Adding Characters — Guide & Research Notes

This document covers the full process of adding a new SSBU character: where to get GIFs, how to structure the data, and lessons learned from adding Little Mac, Min Min, and Donkey Kong.

---

## Quick Checklist

1. Add character entry to `data/smash-bros/characters.json`
2. Create `data/smash-bros/moves/<slug>.json` with all moves
3. Find GIF URLs (see sources below)
4. Push — GitHub Actions will migrate images to Cloudinary automatically

---

## Character Entry Format (`characters.json`)

```json
{
  "slug": "little-mac",
  "name": "Little Mac",
  "portrait": "https://static.wikia.nocookie.net/ssb/images/e/e8/Little_Mac_-_Super_Smash_Bros._Ultimate.png/revision/latest?cb=20180612204955",
  "description": "One-line description of playstyle.",
  "tags": ["lightweight", "ground-fighter", "high-risk"]
}
```

**Finding portrait URLs**: Use the Fandom wiki API:
```
https://supersmashbros.fandom.com/api.php?action=query&list=allimages&ailimit=20&aiprefix=<CharacterName>_SSBU&format=json&aiprop=url
```
Portrait filenames follow one of two patterns:
- `<Character>_SSBU.png` (e.g. `Min_Min_SSBU.png`)
- `<Character>_-_Super_Smash_Bros._Ultimate.png` (e.g. `Little_Mac_-_Super_Smash_Bros._Ultimate.png`)

The Cloudinary migration script will replace `portrait` with a Cloudinary URL after push.

---

## GIF Sources

There are two distinct SSB wikis. They look similar but serve completely different content:

### ✅ Source A — Fandom SSB Wiki (gameplay GIFs)

| Property | Value |
|----------|-------|
| Domain | `static.wikia.nocookie.net/ssb/images/` |
| Content | **Real in-game footage** — actual stages, character models, no overlays |
| URL format | `https://static.wikia.nocookie.net/ssb/images/{h1}/{h1h2}/{Filename}_SSBU.gif` |
| Example | `https://static.wikia.nocookie.net/ssb/images/2/2d/Mario_Jab_SSBU.gif` |

**How to find URLs for a character:**
```
https://supersmashbros.fandom.com/api.php?action=query&list=allimages&ailimit=100&aiprefix=<CharacterName>&format=json&aiprop=url|mime
```
Filter by `mime: "image/gif"` and `name` ending in `_SSBU.gif`.

**Known filename patterns:**
```
<Char>_Jab_SSBU.gif
<Char>_Side_Tilt_SSBU.gif
<Char>_Up_Tilt_SSBU.gif
<Char>_Down_Tilt_SSBU.gif
<Char>_Dash_Attack_SSBU.gif
<Char>_Forward_Smash_SSBU.gif  (or F_Smash)
<Char>_Up_Smash_SSBU.gif
<Char>_Down_Smash_SSBU.gif
<Char>_Neutral_Air_SSBU.gif
<Char>_Forward_Air_SSBU.gif
<Char>_Back_Air_SSBU.gif
<Char>_Up_Air_SSBU.gif
<Char>_Down_Air_SSBU.gif
<Char>_Grab_%26_Pummel_SSBU.gif
<Char>_Forward_Throw_SSBU.gif
<Char>_Back_Throw_SSBU.gif
<Char>_Up_Throw_SSBU.gif
<Char>_Down_Throw_SSBU.gif
<Char>_Neutral_B_SSBU.gif
<Char>_Side_B_SSBU.gif
<Char>_Up_B_SSBU.gif
<Char>_Down_B_SSBU.gif
<Char>_Edge_Attack_SSBU.gif
```

**Coverage**: Mario ✅ full, Link ✅ full, Pikachu ✅ full, Min Min ✅ partial (5 GIFs), Donkey Kong ✅ full, Little Mac ❌ none (SSBU GIFs not uploaded to Fandom)

---

### ⚠️ Source B — SmashWiki (hitbox GIFs — NOT real gameplay)

| Property | Value |
|----------|-------|
| Domain | `ssb.wiki.gallery/images/` |
| Content | **Hitbox visualization** — colored overlay boxes on dark background, NOT real gameplay |
| URL format | `https://ssb.wiki.gallery/images/{h1}/{h1h2}/LittleMacJab1SSBU.gif` |
| Example | `https://ssb.wiki.gallery/images/4/47/LittleMacJab1SSBU.gif` |

These are useful for move accuracy research but **should not be shown as gameplay GIFs** in the app. Do not use as `mediaUrl`.

Coverage: Complete for all characters and all moves in SSBU.

---

## Little Mac — Special Case

**Problem**: Fandom wiki has zero SSBU GIFs for Little Mac. The only GIFs on Fandom are from SSB4/3DS (2014).

**Current state**: `little-mac.json` uses `ssb.wiki.gallery` hitbox GIFs. These are the only complete GIF set available for Little Mac SSBU online.

**Options to improve in the future**:

1. **SSB4/3DS Fandom GIFs as placeholders** — Real gameplay but wrong game. Little Mac's animations are nearly identical. Partial coverage only (16 moves, missing aerials/throws).
   - Sample: `https://static.wikia.nocookie.net/ssb/images/b/b2/Little-Mac-Jab-1-SSB3DS.gif/revision/latest?cb=20181209113319`

2. **Custom GIF creation** — Download YouTube clips (e.g. "Little Mac SSBU jab") and convert to GIF with `ffmpeg`, then add to Cloudinary directly.

3. **Wait** — Fandom wiki contributors may eventually upload SSBU GIFs.

---

## Move File Structure

Every move JSON file is an array of moves. Each move follows this structure:

```json
{
  "id": "jab",
  "name": { "en": "Neutral Attack (Jab)", "vi": "Đấm liên hoàn (Jab)" },
  "description": { "en": "...", "vi": "..." },
  "category": "ground",
  "combos": [
    {
      "handheld": [
        { "buttons": ["a"], "inputType": "Tap" }
      ],
      "single-joycon": [
        { "buttons": ["a"], "inputType": "Tap" }
      ]
    }
  ],
  "mediaUrl": "https://static.wikia.nocookie.net/ssb/images/...",
  "sourceUrl": "https://static.wikia.nocookie.net/ssb/images/..."
}
```

**Key rules**:
- `mediaUrl` = URL displayed in UI (will become Cloudinary URL after migration)
- `sourceUrl` = original source URL (preserved for credit; also used to re-migrate if needed)
- Set both to the same value initially — Cloudinary migration will update `mediaUrl`
- If `mediaUrl` already points to Cloudinary AND `sourceUrl` is set, the migration script will skip the move. To re-migrate with a different source, clear the Cloudinary URL from `mediaUrl`.

### Standard move IDs (27 moves)

| ID | Category |
|----|----------|
| `jab` | ground |
| `dash-attack` | ground |
| `forward-tilt` | ground |
| `up-tilt` | ground |
| `down-tilt` | ground |
| `forward-smash` | ground |
| `up-smash` | ground |
| `down-smash` | ground |
| `neutral-air` | aerial |
| `forward-air` | aerial |
| `back-air` | aerial |
| `up-air` | aerial |
| `down-air` | aerial |
| `grab` | grab |
| `pummel` | grab |
| `forward-throw` | grab |
| `back-throw` | grab |
| `up-throw` | grab |
| `down-throw` | grab |
| `neutral-special` | special |
| `side-special` | special |
| `up-special` | special |
| `down-special` | special |
| `final-smash` | special |
| `floor-attack` | misc |
| `ledge-attack` | misc |

Characters may add extra character-specific moves (e.g. `ko-punch` for Little Mac, `cargo-throw` for Donkey Kong).

### Input combo format

```json
"combos": [
  {
    "handheld": [
      { "buttons": ["a"], "inputType": "Tap" }
    ],
    "single-joycon": [
      { "buttons": ["a"], "inputType": "Tap" }
    ]
  }
]
```

Multiple combo entries = alternative methods (shown as tabs in the UI). Each can have an optional `"label": { "en": "...", "vi": "..." }`.

**Button names**:
- Handheld: `"a"`, `"b"`, `"x"`, `"y"`, `"l"`, `"r"`, `"zl"`, `"zr"`, `"left-stick"`, `"right-stick"`
- Single Joy-Con: `"a"`, `"b"`, `"x"`, `"y"`, `"sl"`, `"sr"`, `"stick"`, `"zl"`

**inputType values**: `"Tap"`, `"Hold"`, `"Smash"`, `"Flick"`

For smash attacks (stick + button with separate types):
```json
{ "buttons": ["left-stick", "a"], "direction": "right", "buttonInputTypes": { "left-stick": "Smash", "a": "Tap" } }
```

---

## Characters Added So Far

| Character | Slug | Moves | GIF Source | Notes |
|-----------|------|-------|------------|-------|
| Mario | `mario` | 31 | Fandom (gameplay) | Complete |
| Link | `link` | 27 | Fandom (gameplay) | Complete — was migrated with hitbox GIFs initially, reset and re-migrated |
| Pikachu | `pikachu` | 27 | Fandom (gameplay) | Complete |
| Little Mac | `little-mac` | 27 | ssb.wiki.gallery (hitbox) | No SSBU gameplay GIFs exist on Fandom wiki |
| Min Min | `min-min` | 27 | Fandom (gameplay, partial) | Only 5 SSBU GIFs on Fandom; placeholder used for rest |
| Donkey Kong | `donkey-kong` | 27 | Fandom (gameplay) | Complete |

---

## Cloudinary Migration

Images are hosted on Cloudinary. The migration happens automatically via GitHub Actions on push.

The script (`scripts/migrate-media-to-cloudinary.mjs`) will:
- Skip YouTube, Vimeo, Dailymotion, `.mp4`, `.webm` URLs
- Skip any move already migrated (has `sourceUrl` + `mediaUrl` points to Cloudinary)
- Upload GIF/PNG/JPG/WebP to `help-me-play/<game>/<char>/<moveId>`
- Save Cloudinary URL to `mediaUrl`, keep original in `sourceUrl`

**To force re-migration** (e.g. wrong GIF was uploaded): clear the Cloudinary URL from `mediaUrl` (set it back to `sourceUrl`). The script will then re-upload.
