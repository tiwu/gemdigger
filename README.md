# ⛏ Gemdigger

A browser-based mining game built with vanilla HTML5 Canvas. Play as a drill, dig through the earth, collect gems, avoid hazards, chain combos, and upgrade your rig!

## 🎮 How to Play

Open `index.html` in any modern browser — no server, no dependencies required.

### Controls

| Input | Action |
|-------|--------|
| Arrow Keys | Move / Dig |
| On-screen D-Pad | Move / Dig (mobile/touch) |
| 🔊 button (top right) | Toggle sound on/off |
| 🏆 button (top right) | View leaderboard |
| ⚙️ button (top right) | Open settings (D-pad visibility, SFX/music volume) |


### Objective

Dig as deep as possible through 5 distinct biomes to find increasingly valuable gems. Chain gem hits for combo multipliers. Manage both **Fuel** and **Hull Integrity** — run out of either and your run ends. Return to the **🏠 Surface Base** to refuel, repair, and spend your score on upgrades. Somewhere in the deepest layer lies a single, one-of-a-kind **Unobtainium** — find it for a massive score bonus!

---

## 🗺️ Tile Types

| Tile | Appearance | Description |
|------|-----------|-------------|
| Dirt | Brown | Easy to dig through |
| Stone | Grey | Harder to dig, costs extra fuel |
| 🟡 Gold | Yellow glow | +50 score |
| 🔴 Ruby | Red glow | +100 score, found from the Ice Layer down |
| 🟢 Emerald | Green glow | +150 score, found from the Magma Layer down |
| 🔵 Diamond | Cyan glow | +200 score, found deep |
| 🔷 Sapphire | Blue glow | +300 score, Deep Core only |
| ✨ **Unobtainium** | Rainbow pulse | **+5000 score — exactly ONE exists per world**, Deep Core only |
| Bedrock | Dark grey | Impassable border walls |
| ⛽ Fuel Canister | Orange | Restores +40 fuel when dug |
| 🏠 Base | Green | Surface refuel/repair station + shop |
| 🌋 Lava | Red/orange glow | **Impassable** — drains fuel AND hull on contact |
| Unstable Rock | Brown + cracks | Digging triggers a nearby cave-in, may damage hull |

---

## 🌍 Biomes

The 80×120 tile world (up to ~236m deep) is divided into 5 procedurally-varied biomes, each with its own palette and gem distribution:

| Biome | Depth | Look | Notable |
|-------|-------|------|---------|
| **Surface** | 0–8% | Neutral blue-grey | Starting area, base station |
| **Cavern** | 8–35% | Dark brown | Gold begins appearing |
| **Ice Layer** | 35–55% | Cool blue tint | Ruby begins appearing |
| **Magma Layer** | 55–78% | Warm red tint | Heavy Lava, Emerald begins appearing |
| **Deep Core** | 78–100% | Near-black, purple tint | Diamond, Sapphire, and the legendary Unobtainium |

The current biome name is displayed in the UI next to your depth reading.

---

## ⛽🛡️ Fuel & Hull Systems

Two independent resources keep you alive:

**Fuel** — depletes with every move (more for Stone). Refuel via:
- ⛽ Fuel Canisters underground (+40 fuel)
- 🏠 Surface Base (full refuel)

**Hull Integrity** — your drill's structural health. Damaged by:
- 🌋 Lava contact (also drains fuel)
- Cave-ins (if you're caught in the collapse radius)

Repaired only at the 🏠 Surface Base (full repair). **Either resource hitting zero ends your run** — Fuel loss shows "⛽ Out of Fuel!", Hull loss shows "💥 Drill Destroyed!".

---

## 🔥 Combo System

Mine gems back-to-back (without moving through empty tiles in between) to build a streak:

- Each consecutive gem hit increases your multiplier by **+0.5x**, capped at **5x**
- A 3-second timer keeps the streak alive — dig slowly and it resets
- Hitting lava, triggering a cave-in, or moving through empty space also resets your combo
- Your current combo and multiplier are shown in the UI, plus floating "`+150 (2.5x)`" feedback on each hit

---

## 🏪 Upgrade Shop

Visit the **🏠 Surface Base** to open the shop. Spend your score on 5 upgrade tracks:

| Upgrade | Effect | Max Level |
|---------|--------|-----------|
| ⚙️ Drill Power | Increases drill strength | Lv 4 |
| 🚀 Move Speed | Faster movement animation | Lv 3 |
| ⛽ Fuel Efficiency | Reduces fuel cost per move | Lv 3 |
| 🛢️ Fuel Tank | Increases max fuel capacity | Lv 3 |
| 🛡️ Hull Plating | Increases max hull & reduces damage taken (up to 45%) | Lv 3 |

---

## 🏆 Leaderboard

Every completed run (score, depth reached, gems collected) is saved to a local top-10 leaderboard, stored in `localStorage`. View it any time via the 🏆 button, or from the Game Over screen. Your #1 run is marked with a 👑.

Your all-time **high score** is also tracked separately and shown in the top-left UI panel.

---

## 🔊 Audio & ✨ Particles

- All sound effects are **procedurally synthesized** using the Web Audio API (oscillator beeps) — no external audio files needed. Includes distinct sounds for digging, gem pickup (pitch scales with rarity), fuel pickup, lava damage, cave-ins, shop purchases, and a special fanfare for the Unobtainium.
- Toggle sound on/off anytime with the 🔊/🔇 button.
- A lightweight particle system adds visual feedback: dig chips, gem sparkle bursts (color-matched), lava embers, and cave-in dust clouds.

---

## 🛠️ Technical Details

- **Single file**: All HTML, CSS, and JavaScript in `index.html`
- **No dependencies**: Pure vanilla JS, no frameworks or libraries
- **Rendering**: HTML5 Canvas API with viewport culling (only visible tiles drawn each frame)
- **Game loop**: `requestAnimationFrame` at 60fps, pauses while the shop is open
- **World size**: 80×120 tiles (~236m max depth)
- **Storage**: `localStorage` for high score + top-10 leaderboard
- **Audio**: Web Audio API oscillators (no audio assets)
- **Mobile**: On-screen D-Pad with touch + hold-to-repeat support

---

## 📋 Development Status

See [plan.md](plan.md) for the full development plan and progress log.

**Completed phases:**
- ✅ Phase 1 — Core Foundation
- ✅ Phase 2 — Gameplay Loop (fuel, game over, depth generation, base)
- ✅ Phase 3 — Progression & Hazards (shop, upgrades, lava, cave-ins)
- ✅ Phase 4 — Polish v1 (high score, mobile D-pad, floating text, animations)
- ✅ Phase 5 — World Expansion & Biomes (80×120 map, 5 biomes)
- ✅ Phase 6 — New Gems & Unobtainium (Ruby, Emerald, Sapphire, unique legendary gem)
- ✅ Phase 7 — Combo/Streak Multiplier System
- ✅ Phase 8 — Hull/Damage System (separate from fuel, Hull Plating upgrade)
- ✅ Phase 9 — Audio & Particle Effects
- ✅ Phase 10 — Local Leaderboard
- ✅ Phase 12 — Accessibility, Audio Settings & Background Music (settings overlay, procedural music, low-fuel/hull warnings, full keyboard navigation for overlays)


**Potential future features:**
- Drill skins / cosmetic unlocks
- Additional biome-exclusive mechanics (ice slipperiness, magma updrafts)
- Daily seed / shareable world codes
- Achievements system
- Global online leaderboard (requires backend)
