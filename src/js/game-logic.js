// ── GemDigger Pure Game Logic ────────────────────────────────────────────────
// Framework-agnostic game logic (no DOM/canvas/audio access) so it can be
// unit- and integration-tested directly, independent of rendering/UI code.

export const TILES = {
    EMPTY:0, DIRT:1, STONE:2, GOLD:3, DIAMOND:4, BEDROCK:5, FUEL:6, BASE:7,
    LAVA:8, UNSTABLE:9, RUBY:10, EMERALD:11, SAPPHIRE:12, UNOBTAINIUM:13, OUTPOST:14
};

export const GEM_TILES = [TILES.GOLD, TILES.DIAMOND, TILES.RUBY, TILES.EMERALD, TILES.SAPPHIRE, TILES.UNOBTAINIUM];

// Biome definitions: depth fraction range [from, to), plus visual/gameplay flavor.
// gemWeights are multipliers applied to that gem's base probability slice
// while rolling tiles in that biome (1 = normal, >1 = more common, <1 = rarer).
export const BIOMES = [
    {
        name:'Surface', from:0.00, to:0.08, bg:'#1a252f', tint:null,
        stoneColor:'#6b7280', stoneBorder:'#4b5563', dirtColor:'#8b4513', dirtBorder:'#6b3410',
        gemWeights: { GOLD:1, RUBY:0.5, EMERALD:0.5, DIAMOND:0.5, SAPPHIRE:0.3 },
        stoneToughness: 3
    },
    {
        name:'Cavern', from:0.08, to:0.35, bg:'#241a14', tint:null,
        stoneColor:'#7a6a58', stoneBorder:'#584c3d', dirtColor:'#8b4513', dirtBorder:'#6b3410',
        gemWeights: { GOLD:1.4, RUBY:1.2, EMERALD:0.8, DIAMOND:0.7, SAPPHIRE:0.5 },
        stoneToughness: 3
    },
    {
        name:'Ice Layer', from:0.35, to:0.55, bg:'#16232e', tint:'rgba(100,180,255,0.06)',
        stoneColor:'#9fc4d8', stoneBorder:'#6f97ab', dirtColor:'#5f7a8a', dirtBorder:'#425460',
        gemWeights: { GOLD:0.7, RUBY:0.6, EMERALD:0.9, DIAMOND:1.1, SAPPHIRE:1.8 },
        stoneToughness: 5
    },
    {
        name:'Magma Layer', from:0.55, to:0.78, bg:'#2a1210', tint:'rgba(255,80,20,0.08)',
        stoneColor:'#5a2a20', stoneBorder:'#3d1a14', dirtColor:'#6b2f18', dirtBorder:'#471f10',
        gemWeights: { GOLD:0.8, RUBY:1.9, EMERALD:0.6, DIAMOND:0.9, SAPPHIRE:0.6 },
        stoneToughness: 5
    },
    {
        name:'Deep Core', from:0.78, to:1.01, bg:'#050505', tint:'rgba(150,0,255,0.05)',
        stoneColor:'#2b2233', stoneBorder:'#1a1420', dirtColor:'#241a2c', dirtBorder:'#160f1a',
        gemWeights: { GOLD:0.6, RUBY:0.8, EMERALD:1.1, DIAMOND:1.8, SAPPHIRE:1.3 },
        stoneToughness: 8
    }
];

export function getBiome(depthFrac) {
    for (const b of BIOMES) if (depthFrac >= b.from && depthFrac < b.to) return b;
    return BIOMES[BIOMES.length-1];
}

// ── Upgrades ──────────────────────────────────────────────────────────────
export const FUEL_PER_MOVE = 2;
export const MAX_FUEL = 200;
export const MAX_HULL = 100;

// drillPower: crosses stone-toughness thresholds (3 / 5 / 8) as it levels up,
// so each level actually unlocks digging in a deeper biome's stone instead of
// being purely cosmetic.
export const DRILL_POWER_LEVELS = [3, 5, 6, 8, 10];
// fuelEfficiency: percentage-based cost multiplier so every level (0-3) has a
// distinct, meaningful effect instead of flooring out after level 1.
export const FUEL_EFFICIENCY_MULTIPLIERS = [1, 0.8, 0.6, 0.4];

export function getUpgradeValue(id, level) {
    switch(id) {
        case 'drillPower': return DRILL_POWER_LEVELS[Math.min(level, DRILL_POWER_LEVELS.length-1)];
        case 'moveSpeed': return 6 + level*2;
        case 'fuelEfficiency': return FUEL_PER_MOVE * FUEL_EFFICIENCY_MULTIPLIERS[Math.min(level, FUEL_EFFICIENCY_MULTIPLIERS.length-1)];
        case 'fuelCapacity': return MAX_FUEL + level*50;
        case 'hullPlating': return MAX_HULL + level*40;
        default: return 0;
    }
}

export function getHullDamageReduction(hullPlatingLevel) {
    return hullPlatingLevel * 0.15; // up to 45% reduction at level 3
}

// Fuel drain scales with depth so a full round-trip to the surface becomes
// impractical once deep in the mine -- this is what makes Outposts useful.
export function getDepthFuelMultiplier(depthFrac) {
    return 1 + Math.max(0, depthFrac) * 1.6;
}

// Hazard damage (lava, cave-ins) also scales with depth, mirroring fuel
// drain, so Hull Plating capacity/reduction remains relevant late-game
// instead of being trivially absorbed by the base 100 HP pool.
export function getDepthHazardMultiplier(depthFrac) {
    return 1 + Math.max(0, depthFrac) * 1.2;
}

// Returns the toughness required to dig STONE tiles in a given biome
// (falls back to 3, the historical/base value, if unspecified).
export function getStoneToughness(biome) {
    return (biome && biome.stoneToughness) || 3;
}

// ── Combo / Reward math ─────────────────────────────────────────────────────
export function computeComboMultiplier(comboCount) {
    return Math.min(5, 1 + (comboCount-1)*0.5);
}
export function computeReward(baseReward, comboMultiplier) {
    return Math.round(baseReward * comboMultiplier);
}

// ── World generation: pure tile-roll ladder ─────────────────────────────────
// Given a random roll [0,1), a depth fraction [0,1], and a biome object,
// returns the TILES.* constant that should be placed.
// gemWeights on the biome scale each gem's base probability slice.
export function pickTileForRoll(rand, depth, biome) {
    const gw = (biome && biome.gemWeights) || {};
    const w = (key, def) => (gw[key] !== undefined ? gw[key] : 1) * def;

    const stoneP = 0.05 + depth*0.35;
    const goldP = stoneP + w('GOLD', 0.02 + depth*0.05);
    const rubyP = goldP + (depth > 0.30 ? w('RUBY', 0.02) : 0);
    const emeraldP = rubyP + (depth > 0.50 ? w('EMERALD', 0.018) : 0);
    const diamondP = emeraldP + w('DIAMOND', Math.max(0, (depth-0.4)*0.03));
    const sapphireP = diamondP + (depth > 0.75 ? w('SAPPHIRE', 0.012) : 0);
    const fuelP = sapphireP + 0.015*(1-depth*0.5);
    const lavaP = fuelP + (biome && biome.name==='Magma Layer' ? Math.max(0,(depth-0.5)*0.16) : Math.max(0,(depth-0.5)*0.06));
    const unstableP = lavaP + Math.max(0,(depth-0.15)*0.07);

    if (rand < stoneP) return TILES.STONE;
    if (rand < goldP) return TILES.GOLD;
    if (rand < rubyP) return TILES.RUBY;
    if (rand < emeraldP) return TILES.EMERALD;
    if (rand < diamondP) return TILES.DIAMOND;
    if (rand < sapphireP) return TILES.SAPPHIRE;
    if (rand < fuelP) return TILES.FUEL;
    if (rand < lavaP) return TILES.LAVA;
    if (rand < unstableP) return TILES.UNSTABLE;
    return TILES.DIRT;
}

// ── Outposts ─────────────────────────────────────────────────────────────
export const OUTPOST_KIT_COSTS = [800, 1500];
export const MAX_OUTPOSTS = 2;

// Whether another outpost kit can be purchased given how many have been
// purchased so far this run.
export function canBuyOutpost(purchasedCount) {
    return purchasedCount < MAX_OUTPOSTS;
}
export function getOutpostKitCost(purchasedCount) {
    if (purchasedCount >= MAX_OUTPOSTS) return null;
    return OUTPOST_KIT_COSTS[purchasedCount];
}
// Whether the player can deploy a carried outpost onto the given tile type.
export function canPlaceOutpost(tileType, carriedCount, placedCount) {
    if (carriedCount <= 0) return false;
    if (placedCount >= MAX_OUTPOSTS) return false;
    return tileType === TILES.EMPTY;
}

// Outposts are permanent once placed, but each individual outpost has a
// cooldown after use before it can refuel/repair again.
export const OUTPOST_COOLDOWN_MS = 25000;
// lastUsedAtMs: timestamp (ms) the outpost was last used, or null/undefined if never used.
export function canUseOutpost(lastUsedAtMs, nowMs, cooldownMs) {
    const cd = cooldownMs !== undefined ? cooldownMs : OUTPOST_COOLDOWN_MS;
    if (lastUsedAtMs === null || lastUsedAtMs === undefined) return true;
    return (nowMs - lastUsedAtMs) >= cd;
}
// Remaining cooldown time in ms (0 if ready)
export function getOutpostCooldownRemaining(lastUsedAtMs, nowMs, cooldownMs) {
    const cd = cooldownMs !== undefined ? cooldownMs : OUTPOST_COOLDOWN_MS;
    if (lastUsedAtMs === null || lastUsedAtMs === undefined) return 0;
    return Math.max(0, cd - (nowMs - lastUsedAtMs));
}

// ── Achievements ─────────────────────────────────────────────────────────
// Each achievement has a pure `check(stats)` predicate over cumulative
// player stats, a one-time score `reward`, and an optional permanent `perk`
// description (applied by the caller, e.g. a small stat bonus).
export const ACHIEVEMENTS = [
    { id:'depth_50', name:'Getting Dirty', desc:'Reach 50m depth', reward:200,
      check: (s) => s.maxDepth >= 50 },
    { id:'depth_150', name:'Spelunker', desc:'Reach 150m depth', reward:500,
      check: (s) => s.maxDepth >= 150 },
    { id:'depth_300', name:'Core Breacher', desc:'Reach 300m depth', reward:1000,
      check: (s) => s.maxDepth >= 300 },
    { id:'gems_50', name:'Rock Collector', desc:'Collect 50 gems total', reward:300,
      check: (s) => s.totalGems >= 50 },
    { id:'gems_200', name:'Gem Hoarder', desc:'Collect 200 gems total', reward:800,
      check: (s) => s.totalGems >= 200 },
    { id:'unobtainium_1', name:'Legendary Find', desc:'Find your first Unobtainium', reward:1000,
      check: (s) => s.unobtainiumFound >= 1 },
    { id:'unobtainium_3', name:'Unobtainium Master', desc:'Find all 3 Unobtainium in a single run', reward:3000,
      check: (s) => s.unobtainiumInRun >= 3 },
    { id:'runs_5', name:'Persistent Digger', desc:'Complete 5 runs', reward:400,
      check: (s) => s.runsCompleted >= 5 }
];

// Given cumulative stats and a set/array of already-unlocked achievement ids,
// returns the list of achievement objects newly unlocked this evaluation.
export function evaluateAchievements(stats, unlockedIds) {
    const unlockedSet = new Set(unlockedIds || []);
    const newlyUnlocked = [];
    for (const a of ACHIEVEMENTS) {
        if (unlockedSet.has(a.id)) continue;
        if (a.check(stats)) newlyUnlocked.push(a);
    }
    return newlyUnlocked;
}
