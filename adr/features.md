# Phase B: v3.0.0+ Feature Roadmap

Long-term improvements and major new mechanics.

## 1. Input & Controls
- **WASD Support**: Map W/A/S/D keys to navigation in `src/js/main.js`.

## 2. World & Difficulty (The "Drill Wear" Update)
- **Per-Tile Fuel Costs**: 
  - Empty: 0.2 units
  - Dirt: 1.0 units
  - Stone: 3.0 units
  - Hard Rock (Deep Biomes): 5.0+ units
- **Rock Hardness & Drill Wear**:
  - Tiles gain a `hardness` property.
  - Drilling rock harder than your current `drillPower` costs Hull integrity ("wear").
  - New upgrades: Drill Bit Durability, Reinforced Bits.
- **Tunable Balance**: All difficulty rates centralized in a `BALANCE` constant for easy tweaking.

## 3. Graphics & Immersion
- **Procedural Tile Graphics**: Add noise, speckles, and facet shapes to tiles in `src/js/render.js` to differentiate soil types and gems without external assets.

## 4. Progression: Deeper-World Tiers
- **Infinite Descent**: After finding all Unobtainium in a world, players can "Descend" to a new, harder tier.
- **Tier Legendaries**: Each tier has a unique legendary gem required to progress.

## 5. Achievements Expansion
- **Achievement Tiers**: Bronze/Silver/Gold variants of goals with progress tracking.
- **Permanent Perks**: Implementing the `perk` system (e.g., +5% fuel cap, -5% shop prices).
- **Meta-Rank**: Achievement points contribute to a global player rank.

## 6. Social & Multiplayer
- **Hardened Self-Hosted API**: CORS, rate-limiting, and payload validation for the leaderboards.
- **Daily Seed**: Everyone plays the same generated world for 24 hours.
- **Daily/Weekly Leaderboards**: Separate boards for the daily seed.
- **Design Spike: Workers & Real-time Coop**: Exploratory phase for NPC helpers and WebSocket-based multiplayer.
