import { test } from 'vitest';
import assert from 'node:assert';
import { computeComboMultiplier, computeReward } from '../src/js/game-logic.js';

test('combo multiplier is 1 at combo count 1', () => {
    assert.strictEqual(computeComboMultiplier(1), 1);
});

test('combo multiplier increases by 0.5 per additional hit', () => {
    assert.strictEqual(computeComboMultiplier(2), 1.5);
    assert.strictEqual(computeComboMultiplier(3), 2);
});

test('combo multiplier caps at 5', () => {
    assert.strictEqual(computeComboMultiplier(20), 5);
    assert.strictEqual(computeComboMultiplier(100), 5);
});

test('computeReward rounds to nearest integer', () => {
    assert.strictEqual(computeReward(100, 1), 100);
    assert.strictEqual(computeReward(100, 1.5), 150);
    assert.strictEqual(computeReward(50, 2.3333), 117); // 116.665 rounds to 117
});

test('computeReward scales rewards with combo multiplier end-to-end', () => {
    const mult = computeComboMultiplier(3); // 2x
    assert.strictEqual(computeReward(200, mult), 400);
});
