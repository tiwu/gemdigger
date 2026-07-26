// ── Central mutable game state ──────────────────────────────────────────────
// A single shared, mutable object so the various feature modules (movement,
// shop, render, ui, achievements...) can read/update the same live state
// without circular imports. Kept intentionally simple (no framework).
import { MAX_FUEL, MAX_HULL } from './constants.js';

export const state = {
    grid: [],
    player: {},
    score: 0,
    fuel: MAX_FUEL,
    maxFuel: MAX_FUEL,
    hull: MAX_HULL,
    maxHull: MAX_HULL,
    inventory: {},
    gameOver: false,
    shopOpen: false,
    settingsOpen: false,
    keys: {},
    moveTimer: 0,
    upgradeLevels: { drillPower:0, moveSpeed:0, fuelEfficiency:0, fuelCapacity:0, hullPlating:0 },
    comboCount: 0,
    comboMultiplier: 1,
    comboTimer: 0,
    soundEnabled: true,
    unobtainiumFound: false,
    unobtainiumInRun: 0,
    carriedOutposts: 0,
    placedOutposts: 0,
    purchasedOutposts: 0,
    outpostLastUsed: {}, // "x,y" -> timestamp ms
    particles: [],
    floatingTexts: [],
};

export function resetState() {
    state.score = 0;
    state.upgradeLevels = { drillPower:0, moveSpeed:0, fuelEfficiency:0, fuelCapacity:0, hullPlating:0 };
    state.inventory = {};
    state.gameOver = false;
    state.shopOpen = false;
    state.keys = {};
    state.moveTimer = 0;
    state.comboCount = 0;
    state.comboMultiplier = 1;
    state.comboTimer = 0;
    state.unobtainiumFound = false;
    state.unobtainiumInRun = 0;
    state.carriedOutposts = 0;
    state.placedOutposts = 0;
    state.purchasedOutposts = 0;
    state.outpostLastUsed = {};
    state.particles = [];
    state.floatingTexts = [];
}
