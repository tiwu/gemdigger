# Context

We want to create a browser-based mining game ("Digger" style) where they play as a drill searching for gems. Since no existing codebase exists, we're designing a standalone web application from scratch.

## Implementation Plan

Single-file HTML/CSS/JS solution for easy deployment and immediate usability.

### Architecture

- **Rendering**: HTML5 Canvas API. `requestAnimationFrame` loop at 60fps, with viewport culling.
- **Grid System**: 2D array of tiles across an 80×120 world. Each tile type defines drillability, rewards, and hazard behaviour.
- **Player Logic**: Grid-based movement with smooth snap-to-tile animation.
- **Procedural Generation**: Depth-weighted random distribution, further modulated by 5 distinct **biomes**.
- **Audio**: Procedurally generated sound effects via Web Audio API (no external audio files).
- **Particles**: Lightweight in-house particle system for dig/gem/hazard feedback.
- **Persistence**: `localStorage` for high score + top-10 leaderboard.

### Key Features

1. **Drilling**: Arrow keys / on-screen D-Pad, destroy adjacent tiles based on drill power.
2. **Gem Discovery**: Gold, Ruby, Emerald, Diamond, Sapphire — increasing rarity/value with depth. One unique **Unobtainium** exists per world.
3. **Inventory & Scoring**: UI shows gems collected, score, depth, biome, combo.
4. **Fuel & Hull**: Two resource bars — Fuel (movement cost) and Hull (damage from lava/cave-ins). Either reaching 0 ends the run.
5. **Refuelling**: Fuel canisters + Surface Base (full refuel + shop access).
6. **Shop / Upgrades**: 5 upgrade tracks — Drill Power, Move Speed, Fuel Efficiency, Fuel Tank, Hull Plating.
7. **Hazards**: Lava (impassable, damages fuel+hull) and Unstable Rock (triggers cave-ins that can damage hull).
8. **Combo System**: Consecutive gem hits build a score multiplier (up to 5x), reset by timeout, lava, or cave-in.
9. **Biomes**: Surface → Cavern → Ice Layer → Magma Layer → Deep Core, each with distinct visuals and spawn rules.
10. **Leaderboard**: Local top-10 run history (score, depth, gems) stored in `localStorage`.

### Critical Files

- `index.html` — Contains everything: styles, game logic, canvas, audio, particles.

## Verification Plan

1. **Visual Check**: Drill moves correctly, tiles change state from solid to empty.
2. **Collision Test**: Drill cannot pass through Bedrock or Lava without appropriate handling.
3. **Scoring**: Gems added to inventory + score with correct combo multiplier applied.
4. **Fuel/Hull Loop**: Both resources deplete correctly; refuel/repair mechanics work; game over triggers on either reaching 0.
5. **Shop**: All 5 upgrades apply correctly and deduct score.
6. **Hazards**: Lava/cave-in damage both fuel and hull as expected.
7. **Biomes**: Correct biome name & visual tint shown at each depth band.
8. **Unobtainium**: Exactly one exists per generated world, found in Deep Core.
9. **Leaderboard**: Entries persist across page reloads, sorted correctly, capped at 10.
10. **Performance**: Verify 60fps with viewport culling on the larger 80×120 map.

---

# Progress Log & Design Notes

## Development Milestones

### Phase 1 — Core Foundation ✅
- [x] Core Game Loop & Rendering (Canvas API, requestAnimationFrame)
- [x] Grid System & Tile Types
- [x] Procedural Generation (depth-weighted random distribution)
- [x] Basic Drill Mechanics (Power vs. Difficulty)
- [x] Movement Smoothing (snap-to-grid)
- [x] Camera Implementation (dynamic centering, viewport culling)

### Phase 2 — Gameplay Loop ✅
- [x] Bug Fix: Gold/Diamond generation & mining
- [x] Fuel System + Game Over + Restart
- [x] Depth-based generation (gems/hazards scale with Y)
- [x] Fuel Canisters + Surface Base (refuel)

### Phase 3 — Progression & Hazards ✅
- [x] Shop / Upgrade System (Drill Power, Move Speed, Fuel Efficiency, Fuel Tank)
- [x] Lava Hazard
- [x] Unstable Rock / Cave-in Hazard

### Phase 4 — Polish (v1) ✅
- [x] localStorage High Score
- [x] Mobile D-Pad
- [x] Floating text notifications
- [x] Drill rotation + gem glow animation
- [x] Depth meter

### Phase 5 — World Expansion & Biomes ✅
- [x] Map expanded 50×60 → **80×120** (up to 236m depth)
- [x] 5 procedural biomes: Surface, Cavern, Ice Layer, Magma Layer, Deep Core
- [x] Per-biome background color + tint overlay
- [x] Biome name shown in UI next to depth

### Phase 6 — New Gems & Unobtainium ✅
- [x] Ruby (+100, Ice Layer+)
- [x] Emerald (+150, Magma Layer+)
- [x] Sapphire (+300, Deep Core)
- [x] **Unobtainium** — exactly 1 per world, Deep Core only, +5000 score, rainbow pulse animation, "LEGENDARY!!!" popup + fanfare sound

### Phase 7 — Combo/Streak System ✅
- [x] Consecutive gem hits build multiplier (1x → 5x cap, +0.5x per hit)
- [x] 3-second combo timer, resets on timeout
- [x] Combo resets on lava hit, cave-in, or moving through empty tiles
- [x] UI combo counter + floating "+100 (2x)" style feedback

### Phase 8 — Hull / Damage System ✅
- [x] Separate Hull Integrity stat (100 base, upgradeable)
- [x] Lava damages both fuel AND hull
- [x] Cave-ins damage hull if player caught in collapse radius
- [x] Hull reaching 0 → "💥 Drill Destroyed!" game over (distinct from fuel-out)
- [x] 🛡️ Hull Plating upgrade (increases max hull, reduces damage taken up to 45%)
- [x] Hull bar added to UI next to fuel bar

### Phase 9 — Audio & Particles ✅
- [x] Procedural sound effects via Web Audio API (dig, gem — pitch scales with rarity, fuel pickup, lava, cave-in, legendary fanfare, shop purchase)
- [x] Mute/unmute toggle button (🔊/🔇)
- [x] Lightweight particle system: dig chips, gem sparkle bursts, lava embers, cave-in dust

### Phase 10 — Leaderboard ✅
- [x] Local top-10 leaderboard (score, depth reached, gems found) via localStorage
- [x] Accessible via 🏆 button in UI and from Game Over screen
- [x] Sorted descending by score, crown icon on #1

### Phase 11 — Documentation ✅
- [x] plan.md updated with all new milestones
- [x] README.md updated with new tiles, biomes, hull system, audio/particles, leaderboard

## Tile Reference

| Tile        | Symbol | Behaviour |
|-------------|--------|-----------|
| Empty       | —      | Passable, already dug |
| Dirt        | Brown  | Drillable (toughness 1) |
| Stone       | Grey   | Drillable (toughness 3), extra fuel cost |
| Gold        | 🟡     | +50 score |
| Ruby        | 🔴     | +100 score (Ice Layer+) |
| Emerald     | 🟢     | +150 score (Magma Layer+) |
| Diamond     | 🔵     | +200 score (deep) |
| Sapphire    | 🔷     | +300 score (Deep Core) |
| **Unobtainium** | ✨ | **+5000 score, 1x per world**, Deep Core only |
| Bedrock     | Dark   | Impassable border |
| Fuel        | ⛽     | +40 fuel |
| Base        | 🏠     | Permanent, refuel + shop |
| Lava        | 🌋     | Impassable, -30 fuel / -hull on contact |
| Unstable    | Cracked| Triggers cave-in, may damage hull |

## Biome Reference

| Biome | Depth Range | Notes |
|-------|-------------|-------|
| Surface | 0–8% | Base station, mostly Dirt |
| Cavern | 8–35% | Gold appears, standard mix |
| Ice Layer | 35–55% | Blue tint, Ruby appears |
| Magma Layer | 55–78% | Red tint, more Lava, Emerald appears |
| Deep Core | 78–100% | Purple-black tint, Diamond/Sapphire/Unobtainium |

## Technical Notes & Adaptations

- **Movement**: Snap mechanism ensures drill aligns to tile boundaries.
- **Rendering**: Viewport culling — only visible tiles drawn per frame; essential for the larger 80×120 map.
- **Camera**: Clamped offset prevents rendering outside world bounds.
- **Game Loop**: Pauses when shop is open; single update/draw pass per frame.
- **Combo**: Tracked via `comboCount`/`comboMultiplier`/`comboTimer`; broken by empty-tile movement, lava, or cave-in.
- **Hull damage reduction**: `getHullDamageReduction()` scales with Hull Plating level (up to 45% reduction at max level).
- **Unobtainium placement**: Randomly placed once, post-generation, within the Deep Core Y-range, retried up to 500 times to avoid bedrock/base collisions.
- **Sound**: All effects are synthesized oscillator beeps — no audio assets needed, keeps the single-file architecture intact.
- **Particles**: Simple array-based system with gravity (`vy += 0.15`) and alpha fade-out tied to `life`.
- **Leaderboard**: Stored as a sorted JSON array in `localStorage`, capped at the top 10 entries by score.

## Potential Future Features

- [ ] Drill skins / cosmetic unlocks
- [ ] Additional biome-exclusive mechanics (ice slipperiness, magma updrafts)
- [ ] Daily seed / shareable world codes
- [ ] Achievements system
- [ ] Global online leaderboard (requires backend)
