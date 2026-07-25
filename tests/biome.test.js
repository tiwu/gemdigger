const test = require('node:test');
const assert = require('node:assert');
const { getBiome, BIOMES } = require('../game-logic.js');

test('getBiome returns Surface at depth 0', () => {
    assert.strictEqual(getBiome(0).name, 'Surface');
});

test('getBiome returns correct biome at range boundaries', () => {
    assert.strictEqual(getBiome(0.08).name, 'Cavern');
    assert.strictEqual(getBiome(0.35).name, 'Ice Layer');
    assert.strictEqual(getBiome(0.55).name, 'Magma Layer');
    assert.strictEqual(getBiome(0.78).name, 'Deep Core');
});

test('getBiome returns Deep Core at max depth', () => {
    assert.strictEqual(getBiome(1.0).name, 'Deep Core');
    assert.strictEqual(getBiome(0.999).name, 'Deep Core');
});

test('all biomes cover the full [0,1) range with no gaps', () => {
    const sorted = [...BIOMES].sort((a,b)=>a.from-b.from);
    assert.strictEqual(sorted[0].from, 0);
    for (let i=1;i<sorted.length;i++) {
        assert.strictEqual(sorted[i].from, sorted[i-1].to, `Gap/overlap between ${sorted[i-1].name} and ${sorted[i].name}`);
    }
    assert.ok(sorted[sorted.length-1].to >= 1);
});

test('every biome defines stone/dirt colors', () => {
    for (const b of BIOMES) {
        assert.ok(b.stoneColor, `${b.name} missing stoneColor`);
        assert.ok(b.stoneBorder, `${b.name} missing stoneBorder`);
        assert.ok(b.dirtColor, `${b.name} missing dirtColor`);
        assert.ok(b.dirtBorder, `${b.name} missing dirtBorder`);
    }
});
