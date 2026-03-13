# Plan: Help Me Play — Nintendo Switch Game Guides Website

## Context

Build a website showing guides on how to play Nintendo Switch games, starting with Super Smash Bros. The site displays side-by-side combo button visualizations (Joy-Con controllers) and video/GIF demonstrations for each character's moves.

## Assumptions

- Next.js App Router with TypeScript — basis: user confirmed
- Tailwind CSS v4 — basis: user confirmed
- Static export for Vercel deployment — basis: no backend needed
- JSON data files in repo for easy contribution — basis: user requirement
- Only URLs for video/GIF (YouTube, Vimeo, Dailymotion, Giphy, Cloudinary) — basis: user confirmed
- Hybrid SVG shell + React overlay buttons for Joy-Con visualization — basis: best balance of quality and effort
- Responsive design for mobile & desktop — basis: standard requirement

## Approach

**Hybrid SVG + Overlay Buttons + Custom Embed + Nested JSON**

- SVG static files for Joy-Con controller shells (easy to replace/refine)
- React components with absolute positioning for interactive button highlights
- Custom URL parser for video embedding (~50 lines, no external dependency)
- Nested JSON organized by game for scalability and contributor-friendliness

## Tasks

1. **Init Next.js + TypeScript + Tailwind v4**
   - Files: `next.config.ts`, `app/layout.tsx`, `app/globals.css`, `tsconfig.json`
   - Verify: `npm run build` succeeds, dev server starts

2. **Define TypeScript interfaces & JSON data schema**
   - Files: `lib/types.ts`
   - Verify: TypeScript compiles, interfaces cover all data needs

3. **Create seed JSON data (Smash Bros, 3 characters)**
   - Files: `data/games.json`, `data/buttons.json`, `data/smash-bros/meta.json`, `data/smash-bros/characters.json`, `data/smash-bros/moves/mario.json`
   - Verify: JSON parses without errors, conforms to interfaces

4. **Build data loading utilities**
   - Files: `lib/data.ts`
   - Verify: All loader functions return correct types

5. **Build Home page (game grid)**
   - Files: `app/page.tsx`, `components/layout/GameCard.tsx`, `components/layout/Header.tsx`, `components/layout/Footer.tsx`
   - Verify: Home page shows game cards, links work

6. **Build Game page (character list + general tips tabs)**
   - Files: `app/games/[gameSlug]/page.tsx`, `components/ui/Tabs.tsx`, `components/layout/CharacterCard.tsx`
   - Verify: Tabs work, character grid renders, navigation correct

7. **Build MediaEmbed component**
   - Files: `lib/embed.ts`, `components/media/MediaEmbed.tsx`
   - Verify: YouTube and GIF URLs render correctly

8. **Create SVG Joy-Con controller shells**
   - Files: `public/controllers/joy-con-pair.svg`, `public/controllers/joy-con-single-left.svg`, `public/controllers/joy-con-single-right.svg`
   - Verify: SVGs render at multiple sizes

9. **Build Joy-Con button visualization components**
   - Files: `lib/button-positions.ts`, `components/joy-con/ControllerShell.tsx`, `components/joy-con/ButtonHighlight.tsx`, `components/joy-con/JoyConHandheld.tsx`, `components/joy-con/JoyConSingle.tsx`
   - Verify: Buttons appear at correct positions on controller

10. **Build ComboSequence animation**
    - Files: `components/joy-con/ComboSequence.tsx`
    - Verify: Animation plays through steps with button highlighting

11. **Build Character page (side-by-side layout)**
    - Files: `app/games/[gameSlug]/characters/[characterSlug]/page.tsx`, `components/ui/ModeToggle.tsx`
    - Verify: Controller + video side-by-side, mode toggle works, responsive

12. **Add remaining seed data (Link, Pikachu)**
    - Files: `data/smash-bros/moves/link.json`, `data/smash-bros/moves/pikachu.json`
    - Verify: Character pages render correctly

13. **Polish, accessibility, responsive**
    - Files: all pages and components
    - Verify: Lighthouse accessibility > 90, keyboard nav works

14. **Static export & Vercel config**
    - Files: `next.config.ts`
    - Verify: `npm run build` generates `/out`, all routes work statically

## Risks

- **SVG Controller Accuracy** (Medium) — Start simplified, refine later. Controller shells are static assets.
- **Button Position Calibration** (Medium) — Percentage-based positions, tunable independently from SVGs.
- **Video Embed Provider Changes** (Low) — Centralized in one file, easy to fix.

## Next Steps

After implementation: `/cf-review` → `/cf-commit`
