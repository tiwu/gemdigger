import { test } from 'vitest';
import assert from 'node:assert';
import * as GameLogic from '../src/js/game-logic.js';

test('canUseOutpost returns true when never used', () => {
    assert.strictEqual(GameLogic.canUseOutpost(null, 10000), true);
    assert.strictEqual(GameLogic.canUseOutpost(undefined, 10000), true);
});

test('canUseOutpost false immediately after use, true after cooldown elapses', () => {
    const lastUsed = 1000;
    const cd = GameLogic.OUTPOST_COOLDOWN_MS;
    assert.strictEqual(GameLogic.canUseOutpost(lastUsed, lastUsed + 100, cd), false);
    assert.strictEqual(GameLogic.canUseOutpost(lastUsed, lastUsed + cd - 1, cd), false);
    assert.strictEqual(GameLogic.canUseOutpost(lastUsed, lastUsed + cd, cd), true);
    assert.strictEqual(GameLogic.canUseOutpost(lastUsed, lastUsed + cd + 500, cd), true);
});

test('canUseOutpost respects custom cooldown override', () => {
    assert.strictEqual(GameLogic.canUseOutpost(0, 5000, 10000), false);
    assert.strictEqual(GameLogic.canUseOutpost(0, 10000, 10000), true);
});

test('getOutpostCooldownRemaining returns 0 when never used or ready', () => {
    assert.strictEqual(GameLogic.getOutpostCooldownRemaining(null, 5000), 0);
    assert.strictEqual(GameLogic.getOutpostCooldownRemaining(0, GameLogic.OUTPOST_COOLDOWN_MS + 10), 0);
});

test('getOutpostCooldownRemaining returns correct remaining time', () => {
    const remaining = GameLogic.getOutpostCooldownRemaining(1000, 6000, 10000);
    assert.strictEqual(remaining, 5000);
});
