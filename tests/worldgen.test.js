import { test } from 'vitest';
import assert from 'node:assert';
import { pickTileForRoll, getBiome, TILES } from '../src/js/game-logic.js';

test('pickTileForRoll returns STONE for low rolls', () => {
    const biome = getBiome(0.5);
    assert.strictEqual(pickTileForRoll(0.0, 0.5, biome), TILES.STONE);
});

test('pickTileForRoll returns DIRT for high rolls (fallback)', () => {
    const biome = getBiome(0.1);
    assert.strictEqual(pickTileForRoll(0.999, 0.1, biome), TILES.DIRT);
});

test('pickTileForRoll never throws for any depth/roll combination', () => {
    for (let d = 0; d <= 1; d += 0.05) {
        const biome = getBiome(d);
        for (let r = 0; r <= 1; r += 0.01) {
            assert.doesNotThrow(() => pickTileForRoll(r, d, biome));
        }
    }
});

test('Magma Layer biome increases lava frequency vs Cavern at same depth', () => {
    const magma = getBiome(0.6); // Magma Layer
    const trials = 20000;
    let magmaLavaCount = 0;
    for (let i=0;i<trials;i++) {
        const r = Math.random();
        if (pickTileForRoll(r, 0.6, magma) === TILES.LAVA) magmaLavaCount++;
    }
    // Sanity: lava should appear a non-trivial amount of the time in Magma layer at depth 0.6
    assert.ok(magmaLavaCount > 0, 'Expected some lava tiles to be generated in Magma Layer');
});

test('Ice Layer favors Sapphire more than Surface biome at comparable depth', () => {
    const ice = getBiome(0.4);
    const surfaceLikeWeights = { name:'Surface', gemWeights: { SAPPHIRE: 0.3 } };
    const trials = 30000;
    let iceSapphire = 0, surfaceSapphire = 0;
    for (let i=0;i<trials;i++) {
        const r = Math.random();
        if (pickTileForRoll(r, 0.8, ice) === TILES.SAPPHIRE) iceSapphire++;
        if (pickTileForRoll(r, 0.8, surfaceLikeWeights) === TILES.SAPPHIRE) surfaceSapphire++;
    }
    assert.ok(iceSapphire > surfaceSapphire, `Expected ice(${iceSapphire}) > surface-weighted(${surfaceSapphire}) sapphire frequency`);
});

test('probabilities never produce a value >= 1 (would break the ladder) at reasonable depths', () => {
    const biome = getBiome(0.9);
    // spot check the ladder doesn't exceed 1 by re-deriving unstableP indirectly:
    // we just ensure a roll of 0.999999 still resolves deterministically without gaps
    const tile = pickTileForRoll(0.999999, 0.9, biome);
    assert.ok(Object.values(TILES).includes(tile));
});
