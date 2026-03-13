# Help Me Play — Project Documentation

## Overview

**Help Me Play** is a static website that provides visual combo guides for Nintendo Switch games. Users can browse games, select characters, and view move-by-move guides with an interactive Joy-Con controller visualization on the left and embedded video/GIF demonstrations on the right.

The site is entirely data-driven: all games, characters, and moves are defined in JSON files under `data/`, making it easy for non-developers to contribute content without touching any code.

### Key Design Goals

1. **Visual-first learning** — See exactly which buttons to press via an animated SVG controller, paired with a real video demo.
2. **Community-driven** — All content lives in JSON. Adding a new character means creating a single JSON file.
3. **Static and fast** — The entire site is statically exported at build time. No server, no database, no API calls at runtime.
4. **Two controller modes** — Every move shows button combos for both Handheld Mode (Joy-Cons attached) and Single Joy-Con Mode (held sideways).

---

## Architecture

### Tech Stack

| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js 16 (App Router) | File-based routing, static export via `output: "export"` |
| Language | TypeScript | Type safety across data, components, and lib |
| Styling | Tailwind CSS v4 | Utility-first, no custom CSS files needed |
| Hosting | Vercel | Zero-config deploy from `main` branch |
| Data | JSON files | Git-trackable, contributor-friendly, no database |

### Rendering Strategy

The site uses **Static Site Generation (SSG)** exclusively:

- `next.config.ts` sets `output: "export"` and `images: { unoptimized: true }`
- Every dynamic route implements `generateStaticParams()` to pre-render all pages at build time
- The build output goes to `out/` as plain HTML/CSS/JS — deployable to any static host
- No server components that require a Node.js runtime at serve time

### Client vs Server Boundary

| File | Side | Why |
|------|------|-----|
| `app/page.tsx` | Server | Reads JSON at build time, renders static HTML |
| `app/games/[gameSlug]/page.tsx` | Server | Reads game meta + characters at build time |
| `app/games/[gameSlug]/characters/[characterSlug]/page.tsx` | Server | Reads character + moves at build time |
| `GamePageClient.tsx` | Client | Tab switching (Characters / Tips) requires `useState` |
| `CharacterPageClient.tsx` | Client | Controller mode toggle + combo animation require `useState`/`useEffect` |
| `ComboSequence.tsx` | Client | Timer-based step animation requires `useEffect`/`useRef` |
| `ModeToggle.tsx` | Client | Toggle interaction |
| `Tabs.tsx` | Client | Tab switching with keyboard navigation |

Server components read JSON data at build time and pass it as props to client components. Client components handle all interactive UI (tab switching, combo animation, mode toggle).

---

## Page Flow

```
Home (/)
  └─ Lists all games from data/games.json
  └─ Each game card links to /games/{gameSlug}

Game Page (/games/{gameSlug})
  └─ Two tabs:
  │   ├─ "Characters" — grid of character cards from data/{gameSlug}/characters.json
  │   └─ "General Tips" — tips list from data/{gameSlug}/meta.json
  └─ Each character card links to /games/{gameSlug}/characters/{characterSlug}

Character Page (/games/{gameSlug}/characters/{characterSlug})
  └─ Mode toggle: Handheld Mode | Single Joy-Con
  └─ List of moves from data/{gameSlug}/moves/{characterSlug}.json
  └─ Each move shows:
      ├─ Left panel: Animated controller visualization (ComboSequence)
      └─ Right panel: Embedded video/GIF (MediaEmbed)
```

---

## Data Layer

### File Structure

```
data/
  games.json              # Array of Game objects (all games)
  buttons.json            # Button definitions for both controller modes
  {gameSlug}/
    meta.json             # GameMeta: title, description, cover, tips
    characters.json       # Array of Character objects
    moves/
      {characterSlug}.json  # Array of Move objects for one character
```

### Data Types (lib/types.ts)

| Type | Purpose |
|------|---------|
| `Game` | Minimal game entry: `slug`, `title`, `description`, `coverImage?` |
| `GameMeta` | Extended game info including `tips[]` for the General Tips tab |
| `Character` | Character entry: `slug`, `name`, `portrait?`, `description?`, `tags?[]` |
| `Move` | A single move: `id`, `name`, `category`, `combos`, `mediaUrl` |
| `ComboStep` | One step in a combo: `buttons[]`, `direction?`, `inputType?`, `duration?` |
| `ButtonDefinition` | Button metadata: `id`, `label`, `modes[]` |
| `ControllerMode` | Union type: `"handheld" | "single-joycon"` |

### Data Access (lib/data.ts)

All data is loaded synchronously from the filesystem using `fs.readFileSync` + `JSON.parse`. This is safe because data is only read at build time (inside `generateStaticParams` or server component render).

Key functions:
- `getAllGames()` — reads `data/games.json`
- `getGameMeta(gameSlug)` — reads `data/{gameSlug}/meta.json`
- `getCharacters(gameSlug)` — reads `data/{gameSlug}/characters.json`
- `getCharacter(gameSlug, characterSlug)` — finds one character from the list
- `getMoves(gameSlug, characterSlug)` — reads `data/{gameSlug}/moves/{characterSlug}.json`
- `getButtonDefinitions()` — reads `data/buttons.json`

All slug parameters are validated against `/^[a-z0-9-]+$/` to prevent path traversal.

---

## Component Architecture

### Layout Components

```
app/layout.tsx
  ├─ Header        # Top navigation bar with "Help Me Play" link
  ├─ {children}    # Page content
  └─ Footer        # Copyright line
```

### Joy-Con Visualization System

The controller visualization is the core feature. It renders an SVG controller shell with interactive button overlays that highlight during combo animation.

```
ComboSequence (client, manages animation)
  ├─ JoyConHandheld | JoyConSingle (selects based on mode)
  │   ├─ ControllerShell (pure SVG — HandheldShell or SingleJoyConShell)
  │   └─ ButtonHighlight[] (positioned overlays, one per button)
  └─ Step info + play/pause/restart controls
```

#### How combo animation works

1. `ComboSequence` receives a `steps: ComboStep[]` array and the current `mode`
2. A `setTimeout` timer advances `currentStep` through the array
3. Each step's `duration` (default 1000ms) controls how long it stays active
4. The step's `buttons[]` array is passed as `activeButtons` to the controller component
5. `ButtonHighlight` renders each button with either active (yellow glow, scale-up) or inactive (dim gray) styling
6. After the last step, the animation loops back to step 0
7. Users can play/pause and restart the animation

#### Button positioning

Two coordinate maps in `lib/button-positions.ts` define where each button overlay sits:

- `handheldPositions` — positions for the full Switch (left Joy-Con at x 0-30%, screen at 30-70%, right Joy-Con at 70-100%)
- `singleJoyconPositions` — positions for a single vertical Joy-Con

Positions use percentage coordinates (`x`, `y`, `width`, `height`) relative to the SVG container, plus a `shape` for border-radius styling.

#### Direction indicator

When a combo step includes a `direction` (e.g., "up"), a yellow arrow SVG is rendered on top of the analog stick, rotated to point in the specified direction.

### Media Embed System

`MediaEmbed` renders external media based on URL pattern matching:

```
MediaEmbed
  └─ parseMediaUrl(url) → { provider, embedUrl, type }
      ├─ youtube → <iframe src="youtube.com/embed/{id}">
      ├─ vimeo → <iframe src="player.vimeo.com/video/{id}">
      ├─ dailymotion → <iframe src="dailymotion.com/embed/video/{id}">
      ├─ giphy → <img src="media.giphy.com/media/{id}/giphy.gif">
      ├─ cloudinary → <img> or <video> (detected by extension)
      └─ direct → <video> for .mp4/.webm, <img> for .gif/.jpg/.png/.webp
```

Security: URL protocol is validated to allow only `http:` and `https:`. Iframes use `sandbox="allow-scripts allow-same-origin allow-presentation"`.

### UI Components

| Component | Purpose |
|-----------|---------|
| `Tabs` | Generic accessible tab component with keyboard navigation (Arrow keys, Home, End) |
| `ModeToggle` | Radio button group for switching between Handheld and Single Joy-Con modes |
| `GameCard` | Clickable card with cover image, title, and description |
| `CharacterCard` | Clickable card with portrait, name, description, and tags |

---

## Styling

The project uses **Tailwind CSS v4** with no custom theme configuration. Key patterns:

- **Dark mode**: Uses Tailwind's `dark:` variant for all components. The dark mode is inherited from the user's OS preference.
- **Responsive**: Grid layouts use `sm:`, `md:`, `lg:`, `xl:` breakpoints. The character page switches from stacked (mobile) to side-by-side (desktop) at `md:`.
- **Fonts**: Geist Sans (body) and Geist Mono (code) loaded via `next/font/google`.
- **Active button glow**: Uses Tailwind's `shadow-[0_0_12px_4px_rgba(250,204,21,0.6)]` custom shadow with `ring-2 ring-yellow-300` and `scale-110` for the pulsing highlight effect.

---

## Static Assets

All static assets go in `public/` and are served at the root URL path:

```
public/
  images/
    games/
      smash-bros.jpg          # Game cover image
    characters/
      smash-bros/
        mario.png             # Character portrait
        link.png
        pikachu.png
```

Image paths in JSON data use absolute URLs like `/images/games/smash-bros.jpg`.

Note: Images are served unoptimized (`images: { unoptimized: true }` in `next.config.ts`) because the site uses static export.

---

## Build & Deploy

### Build Pipeline

```
npm run build
  → Next.js reads all JSON data files at build time
  → generateStaticParams() pre-renders every game/character page
  → Static HTML/CSS/JS output to out/
```

### Deployment

The site is configured for **Vercel** deployment:
- Push to `main` → automatic deploy
- Static export means no serverless functions needed
- Any static hosting (Netlify, GitHub Pages, S3+CloudFront) also works

### Scripts

| Command | What it does |
|---------|-------------|
| `npm run dev` | Start dev server at localhost:3000 with hot reload |
| `npm run build` | Build static site to `out/` |
| `npm run start` | Serve the built site locally |
| `npm run lint` | Run ESLint |
| `npm run format` | Format all files with Prettier |
| `npm run format:check` | Check formatting without writing |

---

## Accessibility

The project follows WAI-ARIA patterns:

- **Tabs**: Uses `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`, and keyboard navigation (Arrow Left/Right, Home, End)
- **Mode toggle**: Uses `role="radiogroup"` and `role="radio"` with `aria-checked`
- **Controller SVGs**: Include `role="img"` and `aria-label` descriptions
- **Button highlights**: Include `aria-label` with button name and active state
- **Media iframes**: Include `title` attributes
- **Images**: Include `alt` text

---

## Security Considerations

- **Slug validation**: All slugs are validated against `/^[a-z0-9-]+$/` to prevent path traversal attacks in `fs.readFileSync`
- **URL protocol validation**: `parseMediaUrl()` rejects any URL that is not `http:` or `https:` to prevent `javascript:` and `data:` URI injection
- **Iframe sandboxing**: Video embeds use `sandbox="allow-scripts allow-same-origin allow-presentation"` to limit iframe capabilities
- **Static site**: No user input reaches the server at runtime. All data is baked in at build time

---

## Extending the Project

### Adding a new game

1. Add entry to `data/games.json`
2. Create `data/{slug}/meta.json`, `data/{slug}/characters.json`
3. Create `data/{slug}/moves/{character}.json` for each character
4. Add cover image to `public/images/games/{slug}.jpg`
5. Run `npm run build` — new pages are generated automatically

### Adding a new controller mode

1. Add the mode to `ControllerMode` union in `lib/types.ts`
2. Create a new position map in `lib/button-positions.ts`
3. Create a new controller shell SVG component in `components/joy-con/`
4. Create a new `JoyCon{Mode}.tsx` wrapper component
5. Update `ComboSequence.tsx` to render the new controller
6. Update `ModeToggle.tsx` to include the new option
7. Add the new mode's combos to move JSON files

### Adding a new media provider

1. Add a new URL pattern matcher in `lib/embed.ts` (`parseMediaUrl` function)
2. Return the appropriate `provider`, `embedUrl`, and `type`
3. If the provider needs special rendering (not just iframe/img/video), add a case in `MediaEmbed.tsx`
