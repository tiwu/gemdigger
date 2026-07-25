const test = require('node:test');
const assert = require('node:assert');
const {
    getUpgradeValue, getHullDamageReduction, MAX_FUEL, MAX_HULL, FUEL_PER_MOVE,
    getDepthHazardMultiplier, getStoneToughness, getBiome
} = require('../game-logic.js');

test('drillPower crosses stone-toughness thresholds as it levels up', () => {
    assert.strictEqual(getUpgradeValue('drillPower', 0), 3);
    assert.strictEqual(getUpgradeValue('drillPower', 4), 10);
    // Every level should be a distinct, increasing value
    const vals = [0,1,2,3,4].map(l => getUpgradeValue('drillPower', l));
    for (let i=1;i<vals.length;i++) assert.ok(vals[i] > vals[i-1]);
});

test('moveSpeed scales with level', () => {
    assert.strictEqual(getUpgradeValue('moveSpeed', 0), 6);
    assert.strictEqual(getUpgradeValue('moveSpeed', 3), 12);
});

test('fuelEfficiency has 3 distinct meaningful levels (percentage based)', () => {
    assert.strictEqual(getUpgradeValue('fuelEfficiency', 0), FUEL_PER_MOVE);
    const l1 = getUpgradeValue('fuelEfficiency', 1);
    const l2 = getUpgradeValue('fuelEfficiency', 2);
    const l3 = getUpgradeValue('fuelEfficiency', 3);
    assert.ok(l1 < FUEL_PER_MOVE);
    assert.ok(l2 < l1);
    assert.ok(l3 < l2);
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

test('hazard damage multiplier increases with depth', () => {
    assert.strictEqual(getDepthHazardMultiplier(0), 1);
    assert.ok(getDepthHazardMultiplier(1) > getDepthHazardMultiplier(0.5));
    assert.ok(getDepthHazardMultiplier(0.5) > getDepthHazardMultiplier(0));
});

test('stone toughness increases with biome depth, gated behind drillPower levels', () => {
    const surface = getStoneToughness(getBiome(0));
    const ice = getStoneToughness(getBiome(0.4));
    const deepCore = getStoneToughness(getBiome(0.9));
    assert.ok(surface < ice);
    assert.ok(ice < deepCore);
    // Level 0 drill can dig surface stone but not deep core stone
    assert.ok(getUpgradeValue('drillPower', 0) >= surface);
    assert.ok(getUpgradeValue('drillPower', 0) < deepCore);
    // Max level drill can dig everything
    assert.ok(getUpgradeValue('drillPower', 4) >= deepCore);
});
