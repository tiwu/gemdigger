# GemDigger — Phase 14: UX Polish, Rebalance & Retro Boot Screen

## 1. Retro Arcade Startup/Boot Screen
- New overlay shown first on page load (before the tutorial modal / before game becomes interactive).
- CRT/arcade aesthetic: pixel-style title logo with layered text-shadow glow, scanline overlay (repeating-linear-gradient), subtle flicker animation, blinking "PRESS START" / "INSERT COIN" prompt, animated loading bar that fills over ~1.5s.
- Dismiss on any key/click/tap (or auto-continue after load bar completes) → then shows the existing tutorial modal (if not seen before) or goes straight into gameplay.

## 2. Mobile / Portrait HUD Fix
- Add a `@media (max-width: 600px) and (orientation: portrait)` (and generally narrow-viewport) ruleset that:
  - Shrinks the `#ui` stat panel (smaller font/padding, narrower width) and makes it semi-transparent.
  - Repositions top-right buttons into a more compact row so nothing overlaps the canvas.
  - Optionally makes the `#ui` panel collapsible (tap header to expand/collapse) on small screens.

## 3. Outposts: Reusable With Cooldown
- Change outpost behavior: stepping on a placed Outpost refuels/repairs but then starts a cooldown; cannot be used again until cooldown expires.
- Pure logic in `game-logic.js`: `canUseOutpost(lastUsedAtMs, nowMs, cooldownMs)`, `OUTPOST_COOLDOWN_MS` constant.
- Grid stores per-outpost state (map keyed by "x,y" → lastUsedAt) rather than consuming the tile.
- Visual cue: outpost tile shows a greyed/cooldown ring or countdown text while unavailable.
- Update shop description + tutorial modal text.

## 4. Hull vs Fuel Rebalance
- Increase hull-relevant hazard pressure so hull actually matters:
  - Increase lava tile frequency at depth (especially Magma Layer/Deep Core).
  - Increase cave-in (`UNSTABLE`) trigger frequency and/or damage scaling with depth.
  - Slightly reduce depth fuel multiplier growth so fuel isn't the sole limiting resource.
- All tunable numbers live in `game-logic.js` pure functions so they're covered by tests.

## 5. Shop Clarity — Before/After Values
- Each upgrade's shop card computes and displays concrete current → next values, e.g. "Drill Power: 5 → 7", "Max Fuel: 200 → 250", using `getUpgradeValue`.
- Outpost Kit card shows cooldown duration and next cost clearly.

## 6. Achievement System
- New `ACHIEVEMENTS` table in `game-logic.js`: id, name, description, `check(stats)` predicate, `reward` (score bonus and/or permanent perk).
- Track cumulative stats (max depth reached, total gems collected, unobtainium found, runs completed) in `localStorage` so achievements persist across runs.
- Pure helper `evaluateAchievements(stats, unlockedIds)` returns newly unlocked achievement ids (testable).
- UI: achievements overlay/button to view all + unlocked state; floating toast notification + sfx when one unlocks mid-run; reward applied immediately (score bonus added, perk merged into upgrade calculation).

## 7. Improved Graphics
- Stone/dirt tiles: subtle per-tile noise/gradient instead of flat fill for texture.
- Better gem glow/sparkle (layered radial gradient pulse).
- Upgraded drill sprite with more detail + simple "drilling" animation frame when actively mining.
- Enhanced particles: varied shapes/sizes, fade + slight rotation.
- Optional per-biome parallax background accents (dots/motes) for depth.

## 8. Testing
- Add/extend `tests/`:
  - `tests/outpost-cooldown.test.js`
  - `tests/achievements.test.js`
  - Extend `tests/worldgen.test.js` / `tests/biome.test.js` if hazard-probability tuning changes ladder behavior.
- Run `npm test` after each logic change to catch regressions before moving to the next item.

## 9. Final Steps
- Manual smoke test: boot screen → tutorial → mobile portrait view → outposts cooldown → hull damage frequency → shop clarity → achievement unlock → visuals.
- Update `README.md` with all new mechanics (boot screen, outpost cooldown, achievements, rebalance, mobile support, testing instructions).
