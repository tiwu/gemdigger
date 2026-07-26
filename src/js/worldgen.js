// ── World generation ─────────────────────────────────────────────────────────
import { TILES, getBiome, pickTileForRoll } from './game-logic.js';
import { GRID_WIDTH, GRID_HEIGHT, UNOBTAINIUM_COUNT } from './constants.js';
import { state } from './state.js';

export function generateWorld() {
    const grid = state.grid;
    for (let y=0; y<GRID_HEIGHT; y++) {
        grid[y] = [];
        for (let x=0; x<GRID_WIDTH; x++) {
            if (x===0 || x===GRID_WIDTH-1 || y===GRID_HEIGHT-1) { grid[y][x] = TILES.BEDROCK; continue; }
            if (y <= 1) { grid[y][x] = TILES.EMPTY; continue; }

            const depth = (y-2)/(GRID_HEIGHT-3);
            const biome = getBiome(depth);
            const rand = Math.random();

            grid[y][x] = pickTileForRoll(rand, depth, biome);
        }
    }

    // Clear player start + place base
    const startX = Math.floor(GRID_WIDTH/2);
    for (let dy=0; dy<=2; dy++) for (let dx=-1; dx<=1; dx++) {
        const gx=startX+dx, gy=dy;
        if (grid[gy] && gx>=0 && gx<GRID_WIDTH) grid[gy][gx] = TILES.EMPTY;
    }
    grid[0][startX] = TILES.BASE;

    // Place several Unobtainium tiles scattered through the Deep Core zone
    const deepCoreStartY = Math.floor(2 + 0.80*(GRID_HEIGHT-3));
    let placedCount = 0, attempts = 0;
    while (placedCount < UNOBTAINIUM_COUNT && attempts < 2000) {
        const rx = 1 + Math.floor(Math.random()*(GRID_WIDTH-2));
        const ry = deepCoreStartY + Math.floor(Math.random()*(GRID_HEIGHT-3-deepCoreStartY));
        if (grid[ry] && grid[ry][rx] !== TILES.BEDROCK && grid[ry][rx] !== TILES.BASE && grid[ry][rx] !== TILES.UNOBTAINIUM) {
            grid[ry][rx] = TILES.UNOBTAINIUM;
            placedCount++;
        }
        attempts++;
    }
}
