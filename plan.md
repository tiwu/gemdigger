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

---

# GemDigger — Phase 15: Bugfixes, Leaderboard Names & Arcade Audio Vibe

## 1. Bugfix: Fuel not full when leaving Base
- In `tryMove`'s `TILES.BASE` handling, the fuel-cost deduction for the move
  was applied *after* refueling to max, leaving the tank slightly less than
  full on departure.
- Fix: deduct the move's fuel cost first, then set `fuel = maxFuel` (and
  `hull = maxHull`) so leaving the base always yields a completely full tank.

## 2. Bugfix: Outpost tile vanishing/re-required after use
- The `TILES.OUTPOST` branch in `tryMove` had no early `return`, so execution
  fell through to the generic `grid[y][x] = TILES.EMPTY` at the end of the
  block, erasing the outpost every time it was used (making it look like it
  "got picked up again").
- Fix: handle `OUTPOST` like `BASE`/`LAVA` — perform the refuel/cooldown
  logic and `return` immediately, without ever clearing the tile or treating
  it as regular diggable terrain. Outposts remain in place permanently once
  deployed; reusability is still governed by the existing cooldown logic.

## 3. Leaderboard: Allow Entering a Name
- Add a name input + "Save Score" button to the Game Over overlay.
- Persist the last-used player name in `localStorage` and prefill the input
  each run.
- Leaderboard entries gain a `name` field (default "Anonymous" if the player
  never enters one) and the leaderboard list UI displays it.
- Existing leaderboard entries without a name are handled gracefully
  (rendered as "Anonymous").

## 4. Audible Low-Fuel Urgency Cue
- Currently the low-fuel warning beep fires at a fixed ~1.5s interval once
  fuel ≤ 20%. Rework so the beep interval shrinks and pitch rises the closer
  fuel gets to 0 (e.g. interval scales from ~90 frames down to ~20 frames,
  pitch increases proportionally) — a classic "running out of time" arcade
  tension cue.

## 5. 8-bit Chiptune Boot Jingle
- Add a short procedural arpeggio/jingle using square-wave oscillators,
  reminiscent of 80s/90s demoscene intros, that plays once when the boot
  screen is active.
- Triggered on the first user gesture (keydown/mousedown/touchstart) due to
  browser autoplay restrictions, guarded to only play once per page load.

## 6. Retro Arcade Music Vibe
- Rework the procedural biome background music to feel more "8-bit arcade"
  rather than ambient:
  - Switch the lead voice to a `square` wave with a punchier envelope.
  - Add a simple second (bass) voice under the lead, using `triangle`/
    `square` an octave down, for a fuller chiptune sound.
  - Keep respecting `settings.music` / `settings.musicVol`.

## 7. Testing & Docs
- Run `npm test` to ensure no regressions in pure game-logic tests.
- Update `README.md` describing the fixes and new audio/leaderboard features.

---

# GemDigger — Phase 16: Shop / Upgrade Economy Rebalance

## Problem
Several shop upgrades had little to no gameplay impact:
- **Drill Power** (5 levels, up to 1000 pts): base value already exceeded the
  only toughness gate in the game (STONE = 3), making every level after the
  first purely cosmetic.
- **Fuel Efficiency** (3 levels, up to 600 pts): formula `max(1, FUEL_PER_MOVE
  - level)` floored out after level 1, so levels 2-3 did nothing.
- **Hull Plating** (3 levels, up to 700 pts): hazard damage (lava, cave-ins)
  was a flat, depth-independent number, so the base 100 HP pool trivially
  absorbed many hits — extra capacity/damage-reduction rarely mattered.

## Fixes (all pure logic lives in `game-logic.js`, covered by
`tests/upgrades.test.js`)
1. **Tiered rock toughness by biome depth** — each biome now defines a
   `stoneToughness` (Surface/Cavern = 3, Ice/Magma = 5, Deep Core = 8).
   `getStoneToughness(biome)` exposes this. `drillPower` levels
   (`[3,5,6,8,10]`) now cross each threshold in turn, so leveling up actually
   unlocks digging stone in deeper biomes instead of being cosmetic.
2. **Percentage-based Fuel Efficiency** — `fuelEfficiency` now multiplies
   `FUEL_PER_MOVE` by `[1, 0.8, 0.6, 0.4]` per level (20% cheaper moves per
   level) instead of a floor-at-1 subtraction, giving all 3 levels a distinct,
   meaningful effect.
3. **Depth-scaled hazard damage** — new `getDepthHazardMultiplier(depthFrac)`
   (1x at surface, up to 2.2x at max depth) is applied to both
   `LAVA_HULL_DAMAGE` and `CAVEIN_HULL_DAMAGE` in `index.html`, mirroring the
   existing depth-scaled fuel drain. This makes Hull Plating's extra capacity
   and damage reduction genuinely necessary in Magma Layer/Deep Core.
4. **Shop copy updated** to explain *why* each upgrade matters (e.g. "Breaks
   tougher rock found deeper down").
5. **Shop costs** nudged slightly (Drill Power/Fuel Efficiency curves) to stay
   in line with when each upgrade becomes relevant.
6. Extended `tests/upgrades.test.js` with coverage for the new toughness
   ladder and hazard multiplier.
7. Updated `README.md`'s Upgrade Shop section to describe the new mechanics.

