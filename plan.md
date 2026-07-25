# GemDigger — Biome Distinction, Outposts & Testing Plan

## 1. Biome Visual & Gameplay Distinction
- Add per-biome stone/dirt color palettes (`stoneColor`, `stoneBorder`, `dirtColor`, `dirtBorder`) to the `BIOMES` table.
- `draw()` looks up STONE/DIRT tile colors from the current biome instead of the static `TILE_COLORS` map.
- Add per-biome gem probability weighting (`gemWeights`) so each biome has "signature" gems (e.g. Ice Layer → more Sapphire, Magma → more Ruby, Deep Core → more Diamond).
- Rework the tile-roll ladder in `generateWorld()` into a pure, testable function `pickTileForRoll(rand, depth, biome)`.

## 2. Biome-Specific Ambient Music
- Add a `BIOME_MUSIC` table: note sequence, tempo, oscillator type per biome.
- Track `currentMusicBiome`; detect biome changes in the update loop and switch the music loop's note table/instrument accordingly.
- Keep existing music on/off + volume settings working unchanged.

## 3. Outposts
- Increase `GRID_HEIGHT` (120 → 200) to make the mine deeper.
- Re-tune fuel constants so a round trip to the surface Base is impractical past the Magma Layer with max Fuel Tank upgrade — making outposts a real necessity to reach Deep Core and return.
- New `TILES.OUTPOST` tile type: distinct icon/color; stepping on it fully refuels fuel + hull (like Base) but does **not** open the shop.
- Shop item "🚧 Outpost Kit": expensive, purchasable up to 2 times total per run (800 pts 1st, 1500 pts 2nd). Buying adds to `carriedOutposts` counter (does not place it).
- Deploy action: on-screen "🚧 Deploy" button + `E` keyboard shortcut. Only works while carrying ≥1 outpost and standing on an already-cleared (EMPTY) tile. Consumes one carried outpost, converts tile to OUTPOST, adds to `placedOutposts` (max 2 total ever).
- HUD shows "🚧 Outposts: X carried, Y placed".
- Increase Unobtainium spawn count from 1 to 3, scattered through the (now bigger) Deep Core zone.

## 4. Startup Tutorial Modal
- Add a modal shown on page load explaining: movement, fuel/hull, gems & combo, biomes, outposts, base/shop.
- Dismissible with a button; remember dismissal via `localStorage` so it doesn't reappear every load (with a way to reopen, e.g. via settings or a "?" button).

## 5. Testing
- Extract pure/testable game logic (no DOM/canvas/audio) into `game-logic.js`:
  - `getBiome(depthFrac)`
  - `getUpgradeValue(id, level)` (pure, level passed as param)
  - `computeReward(baseReward, comboMultiplier)`
  - `pickTileForRoll(rand, depth, biome)` (world-gen probability ladder)
  - Outpost rule helpers: `canBuyOutpost(purchasedCount)`, `canPlaceOutpost(tileType, carriedCount)`
  - Hull damage reduction / fuel cost calculations
  - UMD-style export so it works as a `<script>` include (attaches to `window`) and via Node `require()`.
- `index.html` includes `game-logic.js` and calls these shared functions instead of duplicating logic inline.
- Add minimal `package.json` with a `test` script using Node's built-in `node:test` runner (no external dependencies).
- Add `tests/` directory:
  - `tests/biome.test.js`
  - `tests/upgrades.test.js`
  - `tests/worldgen.test.js`
  - `tests/outposts.test.js`
  - `tests/combo.test.js`

## 6. Final Steps
- Smoke test a full run across biomes, verifying outposts, music switching, and visuals.
- Update `README.md` with all new relevant changes (biomes, outposts, tutorial modal, testing instructions).
