const test = require('node:test');
const assert = require('node:assert');
const { getUpgradeValue, getHullDamageReduction, MAX_FUEL, MAX_HULL, FUEL_PER_MOVE } = require('../game-logic.js');

test('drillPower scales with level', () => {
    assert.strictEqual(getUpgradeValue('drillPower', 0), 5);
    assert.strictEqual(getUpgradeValue('drillPower', 4), 13);
});

test('moveSpeed scales with level', () => {
    assert.strictEqual(getUpgradeValue('moveSpeed', 0), 6);
    assert.strictEqual(getUpgradeValue('moveSpeed', 3), 12);
});

test('fuelEfficiency never goes below 1', () => {
    assert.strictEqual(getUpgradeValue('fuelEfficiency', 0), FUEL_PER_MOVE);
    assert.strictEqual(getUpgradeValue('fuelEfficiency', 1), 1);
    assert.strictEqual(getUpgradeValue('fuelEfficiency', 5), 1);
});

test('fuelCapacity scales with level from MAX_FUEL', () => {
    assert.strictEqual(getUpgradeValue('fuelCapacity', 0), MAX_FUEL);
    assert.strictEqual(getUpgradeValue('fuelCapacity', 3), MAX_FUEL + 150);
});

test('hullPlating scales with level from MAX_HULL', () => {
    assert.strictEqual(getUpgradeValue('hullPlating', 0), MAX_HULL);
    assert.strictEqual(getUpgradeValue('hullPlating', 3), MAX_HULL + 120);
});

test('unknown upgrade id returns 0', () => {
    assert.strictEqual(getUpgradeValue('nonexistent', 2), 0);
});

test('hull damage reduction scales linearly and caps sensibly at level 3', () => {
    assert.strictEqual(getHullDamageReduction(0), 0);
    assert.ok(Math.abs(getHullDamageReduction(3) - 0.45) < 1e-9);

});
