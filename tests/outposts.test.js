import { test } from 'vitest';
import assert from 'node:assert';
import { canBuyOutpost, getOutpostKitCost, canPlaceOutpost, MAX_OUTPOSTS, TILES, OUTPOST_KIT_COSTS } from '../src/js/game-logic.js';

test('can buy first and second outpost kit, but not a third', () => {
    assert.strictEqual(canBuyOutpost(0), true);
    assert.strictEqual(canBuyOutpost(1), true);
    assert.strictEqual(canBuyOutpost(2), false);
    assert.strictEqual(MAX_OUTPOSTS, 2);
});

test('outpost kit cost increases for the second purchase, null after cap', () => {
    assert.strictEqual(getOutpostKitCost(0), OUTPOST_KIT_COSTS[0]);
    assert.strictEqual(getOutpostKitCost(1), OUTPOST_KIT_COSTS[1]);
    assert.strictEqual(getOutpostKitCost(2), null);
});

test('cannot place outpost with zero carried', () => {
    assert.strictEqual(canPlaceOutpost(TILES.EMPTY, 0, 0), false);
});

test('cannot place outpost on non-empty tile', () => {
    assert.strictEqual(canPlaceOutpost(TILES.DIRT, 1, 0), false);
    assert.strictEqual(canPlaceOutpost(TILES.STONE, 1, 0), false);
    assert.strictEqual(canPlaceOutpost(TILES.BEDROCK, 1, 0), false);
});

test('can place outpost on empty tile while carrying one and under the cap', () => {
    assert.strictEqual(canPlaceOutpost(TILES.EMPTY, 1, 0), true);
    assert.strictEqual(canPlaceOutpost(TILES.EMPTY, 1, 1), true);
});

test('cannot place outpost once placed count reaches the cap', () => {
    assert.strictEqual(canPlaceOutpost(TILES.EMPTY, 1, 2), false);
});
