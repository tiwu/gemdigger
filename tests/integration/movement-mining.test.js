// ── Integration test: movement/mining wiring against real state & world ────
// Exercises tryMove() (from src/js/movement.js) against the actual shared
// `state` object and a small hand-built grid, verifying tile-consumption,
// fuel/hull consequences, gem collection and combo bookkeeping all work
// together as they do in the running game (not just the pure game-logic
// functions in isolation).
import { test } from 'vitest';
import assert from 'node:assert';
import { TILES } from '../../src/js/game-logic.js';
import { state, resetState } from '../../src/js/state.js';
import { tryMove, setMovementHooks, resetCombo } from '../../src/js/movement.js';
import { GRID_WIDTH, GRID_HEIGHT, TILE_SIZE, MAX_FUEL, MAX_HULL } from '../../src/js/constants.js';

function buildEmptyGrid() {
    const grid = [];
    for (let y=0;y<GRID_HEIGHT;y++) {
        grid[y] = [];
        for (let x=0;x<GRID_WIDTH;x++) grid[y][x] = TILES.EMPTY;
    }
    return grid;
}

function setupState() {
    resetState();
    state.grid = buildEmptyGrid();
    state.maxFuel = MAX_FUEL; state.fuel = MAX_FUEL;
    state.maxHull = MAX_HULL; state.hull = MAX_HULL;
    state.player = { x:5*TILE_SIZE, y:5*TILE_SIZE, targetX:5*TILE_SIZE, targetY:5*TILE_SIZE,
        gridX:5, gridY:5, drillPower:10, moving:false, facing:'down' };

    const events = [];
    setMovementHooks({
        showFloatingText: (text)=>events.push({type:'text', text}),
        spawnParticles: () => {},
        triggerGameOver: (reason)=>{ state.gameOver = true; events.push({type:'gameover', reason}); },
        openShop: () => events.push({type:'shop'}),
        getUpgradeValue: (id) => id==='fuelEfficiency' ? 2 : 0,
        getHullDamageReduction: () => 0,
    });
    return events;
}

test('moving into empty space consumes fuel and updates player grid position', () => {
    setupState();
    const startFuel = state.fuel;
    tryMove(1, 0);
    assert.strictEqual(state.player.gridX, 6);
    assert.ok(state.fuel < startFuel, 'fuel should decrease after a move');
});

test('digging a gem tile awards score, adds to inventory, and clears the tile', () => {
    setupState();
    state.grid[5][6] = TILES.GOLD;
    tryMove(1, 0);
    assert.strictEqual(state.score, 50); // GOLD base reward, combo x1
    assert.strictEqual(state.inventory['Gold'], 1);
    assert.strictEqual(state.grid[5][6], TILES.EMPTY);
});

test('chaining gem hits builds a combo multiplier that boosts reward', () => {
    setupState();
    state.grid[5][6] = TILES.GOLD;
    state.grid[5][7] = TILES.GOLD;
    tryMove(1, 0); // first gold, combo x1 -> +50
    state.player.moving = false; // simulate animation having completed
    tryMove(1, 0); // second gold, combo x1.5 -> +75
    assert.strictEqual(state.score, 50 + 75);
    assert.strictEqual(state.comboCount, 2);
});

test('moving through empty space resets an active combo', () => {
    setupState();
    state.grid[5][6] = TILES.GOLD;
    tryMove(1, 0); // gem hit, combo = 1
    assert.strictEqual(state.comboCount, 1);
    state.player.moving = false; // simulate animation having completed
    tryMove(1, 0); // empty tile move -> combo resets
    assert.strictEqual(state.comboCount, 0);
});


test('bedrock blocks movement entirely', () => {
    setupState();
    state.grid[5][6] = TILES.BEDROCK;
    tryMove(1, 0);
    assert.strictEqual(state.player.gridX, 5, 'player should not move into bedrock');
});

test('drillPower below stone toughness costs hull integrity (Drill Wear) but allows movement', () => {
    setupState();
    state.player.drillPower = 1; // too weak for STONE (toughness 3)
    state.grid[5][6] = TILES.STONE;
    const startHull = state.hull;
    tryMove(1, 0);
    assert.strictEqual(state.player.gridX, 6, 'should now be able to dig tough stone even with weak drill');
    assert.ok(state.hull < startHull, 'hull should decrease due to drill wear');
});

test('running out of fuel triggers game over via hook', () => {
    setupState();
    state.fuel = 0; // already empty -> immediate game over on next move attempt

    let gameOverFired = false;
    setMovementHooks({
        showFloatingText: () => {}, spawnParticles: () => {},
        triggerGameOver: () => { state.gameOver = true; gameOverFired = true; },
        openShop: () => {}, getUpgradeValue: (id)=> id==='fuelEfficiency' ? 2 : 0,
        getHullDamageReduction: () => 0,
    });
    tryMove(1, 0);
    assert.ok(gameOverFired, 'expected game over to trigger once fuel is fully depleted');
});

test('lava tile damages fuel and hull and resets combo, without moving onto the tile', () => {
    setupState();
    state.grid[5][6] = TILES.LAVA;
    const fuelBefore = state.fuel, hullBefore = state.hull;
    tryMove(1, 0);
    assert.ok(state.fuel < fuelBefore);
    assert.ok(state.hull < hullBefore);
    assert.strictEqual(state.comboCount, 0);
});
