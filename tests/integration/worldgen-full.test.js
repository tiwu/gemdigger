// ── Integration test: full world generation ─────────────────────────────────
// Exercises generateWorld() (src/js/worldgen.js) against the real shared
// state object, verifying the whole grid is well-formed: correct dimensions,
// bedrock border, clear player start area, a base tile, and the expected
// count of legendary Unobtainium tiles placed in the deep zone.
import { test } from 'vitest';
import assert from 'node:assert';
import { TILES } from '../../src/js/game-logic.js';
import { state, resetState } from '../../src/js/state.js';
import { generateWorld } from '../../src/js/worldgen.js';
import { GRID_WIDTH, GRID_HEIGHT, UNOBTAINIUM_COUNT } from '../../src/js/constants.js';

test('generateWorld produces a grid with correct dimensions', () => {
    resetState();
    generateWorld();
    assert.strictEqual(state.grid.length, GRID_HEIGHT);
    for (const row of state.grid) assert.strictEqual(row.length, GRID_WIDTH);
});

test('generateWorld surrounds the map with bedrock borders', () => {
    resetState();
    generateWorld();
    for (let y=0;y<GRID_HEIGHT;y++) {
        assert.strictEqual(state.grid[y][0], TILES.BEDROCK);
        assert.strictEqual(state.grid[y][GRID_WIDTH-1], TILES.BEDROCK);
    }
    for (let x=0;x<GRID_WIDTH;x++) assert.strictEqual(state.grid[GRID_HEIGHT-1][x], TILES.BEDROCK);
});

test('generateWorld clears a landing zone around player start and places a base', () => {
    resetState();
    generateWorld();
    const startX = Math.floor(GRID_WIDTH/2);
    assert.strictEqual(state.grid[0][startX], TILES.BASE);
    for (let dy=1; dy<=2; dy++) for (let dx=-1; dx<=1; dx++) {
        assert.strictEqual(state.grid[dy][startX+dx], TILES.EMPTY);
    }
});

test('generateWorld places exactly UNOBTAINIUM_COUNT legendary tiles in the deep zone', () => {
    resetState();
    generateWorld();
    let count = 0;
    const deepCoreStartY = Math.floor(2 + 0.80*(GRID_HEIGHT-3));
    for (let y=deepCoreStartY; y<GRID_HEIGHT-1; y++) {
        for (let x=1; x<GRID_WIDTH-1; x++) {
            if (state.grid[y][x] === TILES.UNOBTAINIUM) count++;
        }
    }
    assert.strictEqual(count, UNOBTAINIUM_COUNT);
});

test('repeated generation always yields a fully playable (non-throwing, bounded) world', () => {
    for (let i=0;i<5;i++) {
        resetState();
        assert.doesNotThrow(() => generateWorld());
        assert.strictEqual(state.grid.length, GRID_HEIGHT);
    }
});
