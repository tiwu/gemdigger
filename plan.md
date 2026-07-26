# GemDigger Restructuring Plan (completed)

## Goals
1. Improve testing (more unit + integration coverage of game mechanics)
2. Break out inline `<style>`/`<script>` from index.html into dedicated files
3. Organize styles/scripts into subfolders
4. Move to Node/ES-module tooling (Vite) instead of vanilla single-file JS
5. Add an optional backend server for an online leaderboard
6. Add an integration testing framework covering real game-mechanics wiring
7. Add a GitHub Actions workflow to build (Node) before deploying to GitHub Pages

## What was done

- **Structure**: `index.html` is now markup-only. CSS split into
  `src/css/{base,overlays,boot-screen,achievements,mobile}.css`. JS split into
  `src/js/{game-logic,constants,state,worldgen,movement,shop,stats,settings,
  audio,leaderboard,render,main}.js` as ES modules.
- **Build tooling**: Added Vite (`vite.config.js`, `package.json` scripts
  `dev`/`build`/`preview`/`test`). `game-logic.js` is a pure ES module
  (no UMD wrapper needed anymore) importable both by the browser bundle and
  by Node test files directly.
- **Testing**: Migrated existing unit tests (`tests/*.test.js`) from
  `node:test` + CommonJS `require` to `vitest` + ESM imports against
  `src/js/game-logic.js`. Added `tests/integration/`:
  - `movement-mining.test.js` — exercises `tryMove()` against the real
    shared `state` object and a hand-built grid (fuel/hull consequences,
    gem pickup/score/inventory, combo streak build-up and reset, bedrock
    blocking, drill-power gating, lava hazard, fuel-depletion game over).
  - `worldgen-full.test.js` — exercises `generateWorld()` end-to-end
    (dimensions, bedrock border, cleared landing zone + base tile,
    correct Unobtainium count, repeated-generation stability).
  All 54 frontend tests pass via `npm test` (Vitest, jsdom environment).
- **Backend**: `server/` — Express + `better-sqlite3` service with
  `POST /api/scores` and `GET /api/scores/top`, a `Dockerfile`, and its own
  integration test suite (`server/tests/scores.test.js`, 4 tests, spins the
  app up in-process against a temp SQLite file). Frontend's existing
  `src/js/leaderboard.js` already best-effort syncs to this API via
  `window.GEMDIGGER_API_BASE` when configured, with a local `localStorage`
  fallback so the game stays fully playable offline.
- **CI/CD**: `.github/workflows/deploy.yml` — on push to `main`: install →
  run frontend tests → run backend tests → `vite build` → upload `dist/` as
  a Pages artifact → deploy to GitHub Pages.
- **Docs**: `README.md` rewritten to document the new structure, test
  strategy, backend usage, and deployment pipeline; briefly notes
  multiplayer (WebSocket-based live play) as a possible larger future step
  beyond the current leaderboard-only backend.

## Deliberately out of scope (future work)
- Real-time multiplayer (would need a stateful WebSocket server, tick sync,
  and anti-cheat design — a substantially bigger effort than the leaderboard).
- Auth/rate-limiting on the leaderboard API (currently trusts client-submitted
  scores; fine for a casual arcade game, but would need hardening before any
  serious anti-cheat concerns).
