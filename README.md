# GemDigger ⛏

 An arcade-style mining game: dig through dirt, stone, gems and hazards across
 five biomes, manage fuel/hull, buy drill upgrades, deploy outposts, unlock
 achievements, and climb the leaderboard.

**v2.1.0 (Current):** Bugfixes and UI stability. Refined D-Pad, Master Mute, improved procedural music, and full shop refills.

## Project structure

```
index.html            Static shell (markup only, no inline JS/CSS)
src/
  css/                Stylesheets split by concern (base, overlays, boot-screen, achievements, mobile)
  js/
    game-logic.js      Pure, framework-agnostic game rules (biomes, upgrades, combo math,
                        world-gen tile ladder, outposts, achievements) — fully unit-testable
    constants.js        Shared tunable constants (grid size, fuel/hull, gem rewards, colors)
    state.js             Single shared mutable game state object + resetState()
    worldgen.js           Grid/world generation (bedrock border, biome tiles, legendary placement)
    movement.js            Player movement/mining/combo/hazard logic, wired via injectable hooks
    shop.js, stats.js, settings.js, audio.js, leaderboard.js, render.js, main.js
                            UI wiring, persistence, audio, rendering and app bootstrap
server/                 Optional backend: Express + SQLite online leaderboard API
tests/                  Unit tests (pure game-logic) + tests/integration (state+module wiring)
```

Game logic is deliberately kept dependency-free from the DOM/canvas/audio so it
can be tested directly with Node. UI/rendering/audio code lives in separate
modules and is wired together in `main.js` via small hook objects, which keeps
`movement.js`/`worldgen.js` testable without a browser.

## Development

```bash
npm install
npm run dev      # Vite dev server with hot reload
npm run build    # Production build to dist/
npm run preview  # Preview the production build locally
```

## Testing

```bash
npm test         # Runs all unit + integration tests once (Vitest)
npm run test:watch
```

- **Unit tests** (`tests/*.test.js`) exercise the pure functions in
  `src/js/game-logic.js` in isolation (biome selection, combo math, upgrade
  scaling, world-gen tile probabilities, outpost rules, achievements).
- **Integration tests** (`tests/integration/*.test.js`) exercise real module
  wiring against the shared `state` object — e.g. `tryMove()` from
  `movement.js` mining a hand-built grid end-to-end (fuel/hull consequences,
  score/inventory updates, combo bookkeeping, game-over triggers), and
  `generateWorld()` producing a fully-formed, bounded world.

## Online leaderboard backend

`server/` is a minimal, optional Node/Express + SQLite (`better-sqlite3`)
service exposing:

- `POST /api/scores` — submit a run (`{ name, score, depth, gems }`)
- `GET /api/scores/top?limit=10` — fetch the global top N scores

Run it locally:

```bash
cd server
npm install
npm start        # listens on :3001 by default (set PORT to override)
npm test         # backend integration tests (spins up the app in-process)
```

A `Dockerfile` is included for containerized deployment. The frontend is
fully playable offline/without this backend — it always keeps a local
top-10 leaderboard in `localStorage`, and will *additionally* sync to the
backend if a page sets `window.GEMDIGGER_API_BASE` before `main.js` loads
(e.g. a small inline `<script>` in `index.html` pointing at your deployed
API's URL). If the backend is unreachable, submissions/reads silently fall
back to the local leaderboard.

### Possible future improvement: multiplayer

The backend's score-submission model is intentionally simple (fire-and-forget
HTTP POST) so it's cheap to run and doesn't require the frontend to maintain
a persistent connection. A natural next step for shared/competitive play
would be a WebSocket layer for live player positions/events, but that's a
substantially larger change (server-authoritative world state, tick sync,
anti-cheat) and is left out of scope for now.

## Deployment (GitHub Pages)

`.github/workflows/deploy.yml` runs on every push to `main`:

1. Installs deps and runs the frontend test suite (`npm test`) and the
   backend test suite (`server && npm test`).
2. Builds the static site with Vite (`npm run build` → `dist/`).
3. Publishes `dist/` to GitHub Pages via the official Pages deploy action.

Enable Pages for the repo under **Settings → Pages → Build and deployment →
GitHub Actions** to activate this.

## Controls

- **Arrow keys / D-Pad**: move & dig
- **E**: deploy a carried outpost kit on cleared ground
- Return to the surface **🏠 Base** to refuel and buy upgrades
- Watch **⛽ Fuel** and **🛡️ Hull** — depleting either ends the run
