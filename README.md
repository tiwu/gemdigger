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
| 🏅 button (top right) | View achievements |
| ❓ button (top right) | Reopen the tutorial/help modal |
| E / 🚧 Deploy button | Deploy a carried Outpost Kit on your current tile |



### Objective

Dig as deep as possible through 5 distinct biomes to find increasingly valuable gems. Chain gem hits for combo multipliers. Manage both **Fuel** and **Hull Integrity** — run out of either and your run ends. Return to the **🏠 Surface Base** to refuel, repair, and spend your score on upgrades. Fuel drains faster the deeper you go, so buy **🚧 Outpost Kits** and deploy them underground as forward refueling points — you'll need them to survive round trips to the Deep Core. Somewhere in the deepest layer lie **3 one-of-a-kind Unobtainium** deposits — find them for a massive score bonus each!

A short tutorial modal explains all of this the first time you load the page (reopen anytime with the ❓ button).


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
| ✨ **Unobtainium** | Rainbow pulse | **+5000 score — 3 scattered in the Deep Core per world** |
| Bedrock | Dark grey | Impassable border walls |
| ⛽ Fuel Canister | Orange | Restores +40 fuel when dug |
| 🏠 Base | Green | Surface refuel/repair station + shop |
| 🚧 Outpost | Orange, pulsing | Player-deployed forward refuel point (max 2 per run) |
| 🌋 Lava | Red/orange glow | **Impassable** — drains fuel AND hull on contact |
| Unstable Rock | Brown + cracks | Digging triggers a nearby cave-in, may damage hull |

---

## 🌍 Biomes

The 80×200 tile world (up to ~394m deep) is divided into 5 procedurally-varied biomes. Each biome has its own **stone and dirt color palette**, background tint, gem rarity weighting, and **ambient music track** — so descending through the mine feels distinctly different at every stage:

| Biome | Depth | Look | Gem Bias | Music |
|-------|-------|------|----------|-------|
| **Surface** | 0–8% | Grey stone, neutral blue-grey bg | Gold favored | Calm sine bassline |
| **Cavern** | 8–35% | Tan/brown stone & dirt | Gold & Ruby favored | Slower triangle-wave loop |
| **Ice Layer** | 35–55% | Pale blue-grey stone, cool tint | Sapphire & Diamond favored | Bright sine loop, higher notes |
| **Magma Layer** | 55–78% | Dark reddish stone, warm tint | Ruby favored, heavy Lava | Tense sawtooth loop |
| **Deep Core** | 78–100% | Near-black purple stone, purple tint | Diamond, Emerald & Sapphire favored, Unobtainium | Slow, deep sine loop |

The current biome name is displayed in the UI next to your depth reading, and the background music automatically crossfades to the new biome's track as you cross a depth boundary.

---

## 🚧 Outposts

Fuel drain **scales with depth** — by the time you reach the Deep Core, round trips to the Surface Base become impractical. To compensate:

- Buy up to **2 Outpost Kits** from the shop (increasing cost each time)
- Carry a kit down and **deploy it** on any cleared (empty) tile using the **🚧 Deploy** button or the **E** key
- Stepping onto a deployed Outpost fully refuels and repairs your drill instantly — no shop popup, just a quick pit-stop
- Outposts are **reusable** — once you use one, it goes on a **25-second cooldown** before it can be used again, so you can rely on the same outpost for multiple round trips, but not spam it endlessly
- Outposts are permanent for the rest of the run once placed



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

## 🏅 Achievements

Persistent, cross-run milestones tracked in `localStorage` (depth reached, total gems collected, Unobtainium found, runs completed). Unlocking one grants an instant one-time score bonus and shows an on-screen toast notification. View your progress any time via the 🏅 button.

---

## 📱 Mobile / Portrait Support

On narrow screens (phones, portrait tablets) the HUD panel automatically shrinks and the top-right buttons compact into a tighter row so nothing overlaps the play field, and the D-Pad repositions/scales down for smaller viewports.

---

## 🕹️ Retro Boot Screen

The game opens with a CRT-style arcade boot screen (scanline flicker, glowing pixel logo, animated loading bar, blinking "PRESS START") before dropping you into the tutorial/gameplay — press any key, click, or tap to skip ahead.

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
- **World size**: 80×200 tiles (~394m max depth)
- **Storage**: `localStorage` for high score + top-10 leaderboard
- **Audio**: Web Audio API oscillators (no audio assets), with biome-specific ambient tracks
- **Mobile**: On-screen D-Pad with touch + hold-to-repeat support
- **Pure logic module**: `game-logic.js` holds framework-agnostic rules (biomes, tile-roll probabilities, upgrades, combo math, outpost rules) and is unit-tested independently of the DOM/canvas code in `index.html`

---

## ✅ Testing

Unit tests for the pure game logic live in `tests/` and run via Node's built-in test runner:

```bash
npm test
```

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
- ✅ Phase 13 — Biome Distinction & Outposts (per-biome stone/dirt colors, gem rarity weighting, biome-specific ambient music, depth-scaled fuel drain, deployable Outposts, 3x Unobtainium, tutorial modal, extracted/tested pure game-logic module)
- ✅ Phase 14 — UX Polish & Rebalance (retro arcade boot screen, mobile/portrait HUD fixes, reusable Outposts with cooldown, rebalanced hull-vs-fuel hazard frequency, shop before→after value display, persistent achievement system with rewards/notifications, improved shop clarity)



**Potential future features:**
- Drill skins / cosmetic unlocks
- Additional biome-exclusive mechanics (ice slipperiness, magma updrafts)
- Daily seed / shareable world codes
- Global online leaderboard (requires backend)

