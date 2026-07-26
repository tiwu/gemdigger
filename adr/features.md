# Phase B: v3.0.0+ Feature Roadmap

# Phase B: v3.0.0 Feature Roadmap (Current)

## 1. Input & Controls
- **WASD Support**: Map W/A/S/D keys (case-insensitive) to navigation in `src/js/main.js`.
- **H or ? for Help**: Map H and ? keys (case-insensitive) to show the help screen.
- **Audio Focus**: Mute audio when the browser window/tab loses focus.
- **Toast Visibility**: Increase size and visibility of toast messages.

## 2. World & Difficulty (The "Drill Wear" Update)
- **Per-Tile Fuel Costs**: 
  - Empty: 0.2 units
  - Dirt: 1.0 units
  - Stone: 3.0 units
  - Hard Rock (Deep Biomes): 5.0+ units
- **Rock Hardness & Drill Wear**: Implement `hardness` property on tiles. Drilling rock harder than `drillPower` costs Hull integrity.
- **New Upgrades**: Add "Reinforced Bits" to reduce drill wear damage.
- **Tunable Balance**: All difficulty rates centralized in a `BALANCE` constant.

## 3. Graphics & Immersion
- **Emoji Gems**: Replace rendered gem shapes with native emojis (e.g., 💎, 💍, 🪙).
- **Procedural Tile Graphics**: Add coordinate-based deterministic noise, speckles, and facet shapes to Dirt/Stone tiles in `src/js/render.js`.

## 4. Onboarding & UI
- **In-Game Changelog**: Add a new UI overlay for release notes.
- **Improved Tutorial**: Update tutorial to explicitly explain the core loop (return to base to refuel/upgrade).

# Phase C: v3.1.0+ Feature Roadmap (Deferred)

## 1. Progression: Deeper-World Tiers
- **Infinite Descent**: After finding all Unobtainium, players can "Descend" to a new, harder tier.
- **Tier Legendaries**: Each tier has a unique legendary gem required to progress.

## 2. Achievements Expansion
- **Achievement Tiers**: Bronze/Silver/Gold variants of goals with progress tracking.
- **Permanent Perks**: Implementing the `perk` system (e.g., +5% fuel cap, -5% shop prices).
- **Meta-Rank**: Achievement points contribute to a global player rank.

## 3. Social & Multiplayer
- **Hardened Self-Hosted API**: CORS, rate-limiting, and payload validation for the leaderboards.
- **Daily Seed**: Everyone plays the same generated world for 24 hours.
- **Daily/Weekly Leaderboards**: Separate boards for the daily seed.
- **Design Spike: Workers & Real-time Coop**: Exploratory phase for NPC helpers and WebSocket-based multiplayer.
