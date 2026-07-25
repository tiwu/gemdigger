// ── GemDigger Pure Game Logic ────────────────────────────────────────────────
// This file contains framework-agnostic game logic (no DOM/canvas/audio access)
// so it can be unit-tested with Node and also used directly in the browser via
// a plain <script> include (attaches everything to window.GameLogic).
(function (root, factory) {
    const mod = factory();
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = mod;
    }
    if (root) {
        root.GameLogic = mod;
    }
})(typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : null), function () {

    const TILES = {
        EMPTY:0, DIRT:1, STONE:2, GOLD:3, DIAMOND:4, BEDROCK:5, FUEL:6, BASE:7,
        LAVA:8, UNSTABLE:9, RUBY:10, EMERALD:11, SAPPHIRE:12, UNOBTAINIUM:13, OUTPOST:14
    };

    const GEM_TILES = [TILES.GOLD, TILES.DIAMOND, TILES.RUBY, TILES.EMERALD, TILES.SAPPHIRE, TILES.UNOBTAINIUM];

    // Biome definitions: depth fraction range [from, to), plus visual/gameplay flavor.
    // gemWeights are multipliers applied to that gem's base probability slice
    // while rolling tiles in that biome (1 = normal, >1 = more common, <1 = rarer).
    const BIOMES = [
        {
            name:'Surface', from:0.00, to:0.08, bg:'#1a252f', tint:null,
            stoneColor:'#6b7280', stoneBorder:'#4b5563', dirtColor:'#8b4513', dirtBorder:'#6b3410',
            gemWeights: { GOLD:1, RUBY:0.5, EMERALD:0.5, DIAMOND:0.5, SAPPHIRE:0.3 }
        },
        {
            name:'Cavern', from:0.08, to:0.35, bg:'#241a14', tint:null,
            stoneColor:'#7a6a58', stoneBorder:'#584c3d', dirtColor:'#8b4513', dirtBorder:'#6b3410',
            gemWeights: { GOLD:1.4, RUBY:1.2, EMERALD:0.8, DIAMOND:0.7, SAPPHIRE:0.5 }
        },
        {
            name:'Ice Layer', from:0.35, to:0.55, bg:'#16232e', tint:'rgba(100,180,255,0.06)',
            stoneColor:'#9fc4d8', stoneBorder:'#6f97ab', dirtColor:'#5f7a8a', dirtBorder:'#425460',
            gemWeights: { GOLD:0.7, RUBY:0.6, EMERALD:0.9, DIAMOND:1.1, SAPPHIRE:1.8 }
        },
        {
            name:'Magma Layer', from:0.55, to:0.78, bg:'#2a1210', tint:'rgba(255,80,20,0.08)',
            stoneColor:'#5a2a20', stoneBorder:'#3d1a14', dirtColor:'#6b2f18', dirtBorder:'#471f10',
            gemWeights: { GOLD:0.8, RUBY:1.9, EMERALD:0.6, DIAMOND:0.9, SAPPHIRE:0.6 }
        },
        {
            name:'Deep Core', from:0.78, to:1.01, bg:'#050505', tint:'rgba(150,0,255,0.05)',
            stoneColor:'#2b2233', stoneBorder:'#1a1420', dirtColor:'#241a2c', dirtBorder:'#160f1a',
            gemWeights: { GOLD:0.6, RUBY:0.8, EMERALD:1.1, DIAMOND:1.8, SAPPHIRE:1.3 }
        }
    ];

    function getBiome(depthFrac) {
        for (const b of BIOMES) if (depthFrac >= b.from && depthFrac < b.to) return b;
        return BIOMES[BIOMES.length-1];
    }

    // ── Upgrades ──────────────────────────────────────────────────────────────
    const FUEL_PER_MOVE = 2;
    const MAX_FUEL = 200;
    const MAX_HULL = 100;

    function getUpgradeValue(id, level) {
        switch(id) {
            case 'drillPower': return 5 + level*2;
            case 'moveSpeed': return 6 + level*2;
            case 'fuelEfficiency': return Math.max(1, FUEL_PER_MOVE - level);
            case 'fuelCapacity': return MAX_FUEL + level*50;
            case 'hullPlating': return MAX_HULL + level*40;
            default: return 0;
        }
    }

    function getHullDamageReduction(hullPlatingLevel) {
        return hullPlatingLevel * 0.15; // up to 45% reduction at level 3
    }

    // Fuel drain scales with depth so a full round-trip to the surface becomes
    // impractical once deep in the mine -- this is what makes Outposts useful.
    function getDepthFuelMultiplier(depthFrac) {
        return 1 + Math.max(0, depthFrac) * 2.2;
    }


    // ── Combo / Reward math ─────────────────────────────────────────────────────
    function computeComboMultiplier(comboCount) {
        return Math.min(5, 1 + (comboCount-1)*0.5);
    }
    function computeReward(baseReward, comboMultiplier) {
        return Math.round(baseReward * comboMultiplier);
    }

    // ── World generation: pure tile-roll ladder ─────────────────────────────────
    // Given a random roll [0,1), a depth fraction [0,1], and a biome object,
    // returns the TILES.* constant that should be placed.
    // gemWeights on the biome scale each gem's base probability slice.
    function pickTileForRoll(rand, depth, biome) {
        const gw = (biome && biome.gemWeights) || {};
        const w = (key, def) => (gw[key] !== undefined ? gw[key] : 1) * def;

        const stoneP = 0.05 + depth*0.35;
        const goldP = stoneP + w('GOLD', 0.02 + depth*0.05);
        const rubyP = goldP + (depth > 0.30 ? w('RUBY', 0.02) : 0);
        const emeraldP = rubyP + (depth > 0.50 ? w('EMERALD', 0.018) : 0);
        const diamondP = emeraldP + w('DIAMOND', Math.max(0, (depth-0.4)*0.03));
        const sapphireP = diamondP + (depth > 0.75 ? w('SAPPHIRE', 0.012) : 0);
        const fuelP = sapphireP + 0.015*(1-depth*0.5);
        const lavaP = fuelP + (biome && biome.name==='Magma Layer' ? Math.max(0,(depth-0.5)*0.10) : Math.max(0,(depth-0.5)*0.03));
        const unstableP = lavaP + Math.max(0,(depth-0.2)*0.04);

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
    const OUTPOST_KIT_COSTS = [800, 1500];
    const MAX_OUTPOSTS = 2;

    // Whether another outpost kit can be purchased given how many have been
    // purchased so far this run.
    function canBuyOutpost(purchasedCount) {
        return purchasedCount < MAX_OUTPOSTS;
    }
    function getOutpostKitCost(purchasedCount) {
        if (purchasedCount >= MAX_OUTPOSTS) return null;
        return OUTPOST_KIT_COSTS[purchasedCount];
    }
    // Whether the player can deploy a carried outpost onto the given tile type.
    function canPlaceOutpost(tileType, carriedCount, placedCount) {
        if (carriedCount <= 0) return false;
        if (placedCount >= MAX_OUTPOSTS) return false;
        return tileType === TILES.EMPTY;
    }

    return {
        TILES, GEM_TILES, BIOMES,
        getBiome,
        getUpgradeValue, getHullDamageReduction,
        computeComboMultiplier, computeReward,
        pickTileForRoll,
        getDepthFuelMultiplier,
        OUTPOST_KIT_COSTS, MAX_OUTPOSTS,
        canBuyOutpost, getOutpostKitCost, canPlaceOutpost,
        FUEL_PER_MOVE, MAX_FUEL, MAX_HULL

    };
});
