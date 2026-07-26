import { test } from 'vitest';
import assert from 'node:assert';
import * as GameLogic from '../src/js/game-logic.js';

test('ACHIEVEMENTS table has valid structure', () => {
    assert.ok(Array.isArray(GameLogic.ACHIEVEMENTS));
    assert.ok(GameLogic.ACHIEVEMENTS.length > 0);
    for (const a of GameLogic.ACHIEVEMENTS) {
        assert.ok(typeof a.id === 'string' && a.id.length > 0);
        assert.ok(typeof a.name === 'string');
        assert.ok(typeof a.desc === 'string');
        assert.ok(typeof a.reward === 'number');
        assert.ok(typeof a.check === 'function');
    }
    // ids must be unique
    const ids = GameLogic.ACHIEVEMENTS.map(a => a.id);
    assert.strictEqual(new Set(ids).size, ids.length);
});

test('evaluateAchievements returns nothing unlocked for zeroed stats', () => {
    const stats = { maxDepth: 0, totalGems: 0, unobtainiumFound: 0, unobtainiumInRun: 0, runsCompleted: 0 };
    const result = GameLogic.evaluateAchievements(stats, []);
    assert.strictEqual(result.length, 0);
});

test('evaluateAchievements unlocks depth milestone', () => {
    const stats = { maxDepth: 60, totalGems: 0, unobtainiumFound: 0, unobtainiumInRun: 0, runsCompleted: 0 };
    const result = GameLogic.evaluateAchievements(stats, []);
    const ids = result.map(a => a.id);
    assert.ok(ids.includes('depth_50'));
    assert.ok(!ids.includes('depth_150'));
});

test('evaluateAchievements does not re-unlock already unlocked achievements', () => {
    const stats = { maxDepth: 60, totalGems: 0, unobtainiumFound: 0, unobtainiumInRun: 0, runsCompleted: 0 };
    const result = GameLogic.evaluateAchievements(stats, ['depth_50']);
    const ids = result.map(a => a.id);
    assert.ok(!ids.includes('depth_50'));
});

test('evaluateAchievements unlocks multiple milestones at once', () => {
    const stats = { maxDepth: 400, totalGems: 250, unobtainiumFound: 1, unobtainiumInRun: 3, runsCompleted: 5 };
    const result = GameLogic.evaluateAchievements(stats, []);
    const ids = result.map(a => a.id);
    assert.ok(ids.includes('depth_50'));
    assert.ok(ids.includes('depth_150'));
    assert.ok(ids.includes('depth_300'));
    assert.ok(ids.includes('gems_50'));
    assert.ok(ids.includes('gems_200'));
    assert.ok(ids.includes('unobtainium_1'));
    assert.ok(ids.includes('unobtainium_3'));
    assert.ok(ids.includes('runs_5'));
    assert.strictEqual(ids.length, GameLogic.ACHIEVEMENTS.length);
});
