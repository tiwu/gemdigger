# Context

We want to create a browser-based mining game ("Digger" style) where they play as a drill searching for gems. Since no existing codebase exists, we're designing a standalone web application from scratch.

## Implementation Plan

I will create a single-file HTML/CSS/JS solution to ensure easy deployment and immediate usability.

### Architecture

- **Rendering**: HTML5 Canvas API for performance. A `requestAnimationFrame` loop will handle rendering at 60fps.
- **Grid System**: A 2D array representing tiles. Each tile type defines its "drillability" (e.g., Dirt = 1, Stone = 3, Gem = 5).
- **Player Logic**: The drill follows basic grid movement but interacts with the friction/resistance of different materials.
- **Procedural Generation**: A simple Cellular Automata or Random Walk algorithm to generate a "diggable" cave structure initially.

### Key Features

1. **Drilling**: Clicking or using arrow keys to destroy adjacent tiles based on "drill power."
2. **Gem Discovery**: Rare gems will spawn in deeper layers, giving points/score.
3. **Inventory System**: Simple UI showing collected gem types and total score.
4. **Progression**: Drills could potentially "level up" or gain speed as more or more unique gems are found.

### Critical Files

- `index.html` (Contains everything: Styles, Game Logic, Canvas)

## Verification Plan

1. **Visual Check**: Ensure the drill moves correctly and tiles change state from "solid" to "empty."
2. **Collision Test**: Verify that the drill cannot pass through impassable walls without digging.
3. **Scoring**: Confirm gems are added to inventory when hit/mined.
4. **Performance**: Verify 60fps on standard hardware.
