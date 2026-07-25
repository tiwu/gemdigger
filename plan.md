# Context

We want to create a browser-based mining game ("Digger" style) where they play as a drill searching for gems. Since no existing codebase exists, we're designing a standalone web application from scratch.

## Implementation Plan

I will create a single-file HTML/CSS/JS solution to ensure easy deployment and immediate usability.

### Architecture

- **Rendering**: HTML5 Canvas API for performance. A `requestAnimationFrame` loop will handle rendering at 60fps.
- **Grid System**: A 2D array representing tiles. Each tile type defines its "drillability" (e.g., Dirt = 1, Stone = 3, Gem = 5).
- **Player Logic**: The drill follows basic grid movement but interacts with the friction/resistance of different materials.
- **Procedural Generation**: Depth-weighted random distribution — gem/hazard probability scales with Y depth.

### Key Features

1. **Drilling**: Arrow keys (or on-screen D-Pad) to destroy adjacent tiles based on "drill power."
2. **Gem Discovery**: Gold and Diamond spawn in deeper layers, giving points/score.
3. **Inventory System**: Simple UI showing collected gem types, total score, and depth.
4. **Fuel System**: Every move costs fuel. Manage fuel carefully or run out and lose.
5. **Refuelling**: Fuel canisters scattered underground (+40 fuel). Surface base refuels to full.
6. **Shop / Upgrades**: Return to base to spend score on drill upgrades.
7. **Hazards**: Lava pockets (impassable, drain fuel on contact) and unstable rock (cave-ins).
8. **Persistence**: High score saved to localStorage.

### Critical Files

- `index.html` (Contains everything: Styles, Game Logic, Canvas)

## Verification Plan

1. **Visual Check**: Ensure the drill moves correctly and tiles change state from "solid" to "empty."
2. **Collision Test**: Verify that the drill cannot pass through impassable walls (Bedrock, Lava) without digging.
3. **Scoring**: Confirm gems are added to inventory when mined.
4. **Fuel Loop**: Confirm fuel depletes, canisters refill, base refuels to full.
5. **Shop**: Confirm upgrades apply correctly and cost is deducted from score.
6. **Hazards**: Confirm lava drains fuel, unstable rock triggers cave-in.
7. **Performance**: Verify 60fps on standard hardware (viewport culling implemented).

---

# Progress Log & Design Notes

## Development Milestones

### Phase 1 — Core Foundation ✅
- [x] Core Game Loop & Rendering (Canvas API, requestAnimationFrame)
- [x] Grid System & Tile Types (Dirt, Stone, Gold, Diamond, Bedrock)
- [x] Procedural Generation (Depth-weighted random distribution)
- [x] Basic Drill Mechanics (Power vs. Difficulty)
- [x] Movement Smoothing (Decoupled axes and snap-to-grid logic)
- [x] Camera Implementation (Dynamic centering on player, viewport culling)

### Phase 2 — Gameplay Loop ✅
- [x] **Bug Fix**: Fixed broken `TILES.GEM` reference — Gold/Diamond now generate and are collectible
- [x] Fuel System (depletes per move, extra cost for Stone)
- [x] Game Over screen (Out of Fuel) with final score + gem summary
- [x] Restart mechanic
- [x] Depth-based generation (gems/hazards scale with Y depth)
- [x] Fuel Canisters (⛽ pickup tiles, +40 fuel)
- [x] Surface Base (🏠 permanent tile, refuels to full + opens shop)

### Phase 3 — Progression & Hazards ✅
- [x] Shop / Upgrade System (opens on base visit)
  - ⚙️ Drill Power (Lv 0–4)
  - 🚀 Move Speed (Lv 0–3)
  - ⛽ Fuel Efficiency (Lv 0–3)
  - 🛢️ Fuel Tank capacity (Lv 0–3)
- [x] Lava Hazard (🌋 impassable, -30 fuel on contact, animated glow)
- [x] Unstable Rock Hazard (cracked visual, triggers cave-in on dig)

### Phase 4 — Polish ✅
- [x] localStorage High Score (persists between sessions, "New High Score!" banner)
- [x] Mobile D-Pad (on-screen buttons, touch + hold-to-repeat)
- [x] Floating text notifications (+Fuel, Cave-in!, gem scores, Refuelled!)
- [x] Drill rotation (faces direction of movement)
- [x] Gem glow animation (pulsing inner glow for Gold/Diamond)
- [x] Depth meter in UI

## Tile Reference

| Tile       | Symbol | Behaviour |
|------------|--------|-----------|
| Empty      | —      | Passable, already dug |
| Dirt       | Brown  | Drillable (toughness 1) |
| Stone      | Grey   | Drillable (toughness 3), extra fuel cost |
| Gold       | 🟡     | Drillable, +50 score |
| Diamond    | 🔵     | Drillable, +200 score (deep only) |
| Bedrock    | Dark   | Impassable border |
| Fuel       | ⛽     | Drillable, +40 fuel |
| Base       | 🏠     | Permanent, refuel + shop |
| Lava       | 🌋     | Impassable, -30 fuel on contact |
| Unstable   | Cracked| Drillable, triggers cave-in |

## Technical Notes & Adaptations

- **Movement**: Implemented a "snap" mechanism during movement to ensure the drill aligns perfectly with tile boundaries, improving collision detection for gems.
- **Rendering**: Viewport culling — only visible tiles are drawn each frame for performance.
- **Camera**: Clamped camera offset prevents rendering outside world bounds.
- **Game Loop**: Standardized on a single update/draw pass within `requestAnimationFrame` for consistent performance. Game loop pauses when shop is open.
- **Fuel Efficiency upgrade**: Uses `getUpgradeValue()` at move-time so upgrades apply immediately after shop close.
- **Cave-in**: Uses `setTimeout` to collapse tiles 500ms after digging unstable rock, giving the player a moment to move clear.

## Potential Future Features

- [ ] More gem types (Ruby, Emerald, Sapphire) with unique effects
- [ ] Drill health / damage system (lava damages drill, not just fuel)
- [ ] Deeper map with procedural "biomes" (ice layer, magma layer)
- [ ] Sound effects (Web Audio API)
- [ ] Particle effects on tile destruction
- [ ] Combo/streak scoring multiplier
- [ ] Leaderboard (server-side or via URL sharing)
