# ⛏ Gemdigger

A browser-based mining game built with vanilla HTML5 Canvas. Play as a drill, dig through the earth, collect gems, avoid hazards, and upgrade your rig!

## 🎮 How to Play

Open `index.html` in any modern browser — no server, no dependencies required.

### Controls

| Input | Action |
|-------|--------|
| Arrow Keys | Move / Dig |
| On-screen D-Pad | Move / Dig (mobile/touch) |

### Objective

Dig as deep as possible to find valuable gems. Collect **Gold** and **Diamond** to earn points. Return to the **🏠 Surface Base** to refuel and spend your score on upgrades. Don't run out of fuel!

---

## 🗺️ Tile Types

| Tile | Appearance | Description |
|------|-----------|-------------|
| Dirt | Brown | Easy to dig through |
| Stone | Grey | Harder to dig, costs extra fuel |
| 🟡 Gold | Yellow glow | +50 score when mined |
| 🔵 Diamond | Cyan glow | +200 score, found deep only |
| Bedrock | Dark grey | Impassable border walls |
| ⛽ Fuel Canister | Orange | Restores +40 fuel when dug |
| 🏠 Base | Green | Surface refuel station + shop |
| 🌋 Lava | Red/orange glow | **Impassable** — touching drains 30 fuel |
| Unstable Rock | Brown + cracks | Digging triggers a nearby cave-in |

---

## ⛽ Fuel System

- Every move costs **2 fuel** (base rate)
- Drilling **Stone** costs an extra **3 fuel**
- Touching **Lava** costs **30 fuel** (and blocks movement)
- **Fuel runs out → Game Over**

### Refuelling
- Pick up **⛽ Fuel Canisters** scattered underground (+40 fuel each)
- Return to the **🏠 Surface Base** for a full refuel (and shop access)

---

## 🏪 Upgrade Shop

Visit the **🏠 Surface Base** to open the shop. Spend your score on upgrades:

| Upgrade | Effect | Max Level |
|---------|--------|-----------|
| ⚙️ Drill Power | Increases drill strength | Lv 4 |
| 🚀 Move Speed | Faster movement animation | Lv 3 |
| ⛽ Fuel Efficiency | Reduces fuel cost per move | Lv 3 |
| 🛢️ Fuel Tank | Increases max fuel capacity | Lv 3 |

---

## 🌍 World Generation

The 50×60 tile world is procedurally generated with depth-weighted probabilities:

- **Near surface**: Mostly Dirt, occasional Stone, Fuel canisters
- **Mid depth**: More Stone, Gold starts appearing, Unstable Rock
- **Deep**: Heavy Stone, Diamond, Lava pockets, rare Fuel

---

## 🏆 Scoring

| Action | Points |
|--------|--------|
| Mine Gold | +50 |
| Mine Diamond | +200 |

Your **high score is saved** in `localStorage` and persists between sessions.

---

## 🛠️ Technical Details

- **Single file**: All HTML, CSS, and JavaScript in `index.html`
- **No dependencies**: Pure vanilla JS, no frameworks or libraries
- **Rendering**: HTML5 Canvas API with viewport culling (only visible tiles drawn)
- **Game loop**: `requestAnimationFrame` at 60fps
- **Storage**: `localStorage` for high score persistence
- **Mobile**: On-screen D-Pad with touch + hold-to-repeat support

---

## 📋 Development Status

See [plan.md](plan.md) for the full development plan and progress log.

**Completed phases:**
- ✅ Phase 1 — Core Foundation (rendering, grid, movement, camera)
- ✅ Phase 2 — Gameplay Loop (fuel, game over, depth generation, base)
- ✅ Phase 3 — Progression & Hazards (shop, upgrades, lava, cave-ins)
- ✅ Phase 4 — Polish (high score, mobile D-pad, floating text, animations)

**Potential future features:**
- More gem types (Ruby, Emerald, Sapphire)
- Drill health / damage system
- Procedural biomes (ice layer, magma layer)
- Sound effects & particle effects
- Combo/streak scoring multiplier
