// ── Shared config / constants used across the game modules ─────────────────
import { TILES } from './game-logic.js';

export const TILE_SIZE = 40;
export const GRID_WIDTH = 80;
export const GRID_HEIGHT = 200;
export const VIEW_TILES_X = 20, VIEW_TILES_Y = 15;

export const FUEL_PER_MOVE = 2, FUEL_PER_STONE = 3, MAX_FUEL = 200;
export const FUEL_CANISTER_AMOUNT = 40;
export const MAX_HULL = 100;
export const LAVA_FUEL_DAMAGE = 30, LAVA_HULL_DAMAGE = 20;
export const CAVEIN_HULL_DAMAGE = 15;
export const UNOBTAINIUM_COUNT = 3;
export const MOVE_DELAY = 8;
export const COMBO_TIMER_MAX = 180; // 3s @ 60fps

export const TILE_COLORS = {
    [TILES.EMPTY]:'#111', [TILES.DIRT]:'#8b4513', [TILES.STONE]:'#6b7280',
    [TILES.GOLD]:'#ffd700', [TILES.DIAMOND]:'#00e5ff', [TILES.BEDROCK]:'#2d2d2d',
    [TILES.FUEL]:'#e67e22', [TILES.BASE]:'#27ae60', [TILES.LAVA]:'#c0392b',
    [TILES.UNSTABLE]:'#a0522d', [TILES.RUBY]:'#e0115f', [TILES.EMERALD]:'#50c878',
    [TILES.SAPPHIRE]:'#0f52ba', [TILES.UNOBTAINIUM]:'#ffffff', [TILES.OUTPOST]:'#f39c12'
};
export const TILE_BORDER_COLORS = {
    [TILES.EMPTY]:'#111', [TILES.DIRT]:'#6b3410', [TILES.STONE]:'#4b5563',
    [TILES.GOLD]:'#b8960a', [TILES.DIAMOND]:'#0099aa', [TILES.BEDROCK]:'#1a1a1a',
    [TILES.FUEL]:'#a04010', [TILES.BASE]:'#1a7a40', [TILES.LAVA]:'#7b0000',
    [TILES.UNSTABLE]:'#6b3010', [TILES.RUBY]:'#8a0a3c', [TILES.EMERALD]:'#2e8b4f',
    [TILES.SAPPHIRE]:'#0a2f6e', [TILES.UNOBTAINIUM]:'#888', [TILES.OUTPOST]:'#b9770e'
};
export const GEM_REWARDS = {
    [TILES.GOLD]:50, [TILES.DIAMOND]:200, [TILES.RUBY]:100, [TILES.EMERALD]:150,
    [TILES.SAPPHIRE]:300, [TILES.UNOBTAINIUM]:5000
};
export const GEM_NAMES = {
    [TILES.GOLD]:'Gold', [TILES.DIAMOND]:'Diamond', [TILES.RUBY]:'Ruby',
    [TILES.EMERALD]:'Emerald', [TILES.SAPPHIRE]:'Sapphire', [TILES.UNOBTAINIUM]:'Unobtainium'
};

export const UPGRADES = [
    { id:'drillPower', name:'⚙️ Drill Power', desc:'Breaks tougher rock found deeper down (Ice/Magma/Deep Core)', costs:[0,150,300,600,1000], maxLevel:4 },
    { id:'moveSpeed', name:'🚀 Move Speed', desc:'Drill moves faster', costs:[0,80,200,400], maxLevel:3 },
    { id:'fuelEfficiency', name:'⛽ Fuel Efficiency', desc:'Reduces fuel cost per move by 20% per level', costs:[0,150,300,500], maxLevel:3 },
    { id:'fuelCapacity', name:'🛢️ Fuel Tank', desc:'Increases max fuel capacity', costs:[0,150,350,700], maxLevel:3 },
    { id:'hullPlating', name:'🛡️ Hull Plating', desc:'Increases max hull & reduces hazard damage (hazards get tougher with depth)', costs:[0,150,350,700], maxLevel:3 },
    { id:'reinforcedBits', name:'💎 Reinforced Bits', desc:'Reduces hull damage taken from drilling rocks harder than your drill.', costs:[0,200,450,900], maxLevel:3 }
];
