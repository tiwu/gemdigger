import { expect, test } from 'vitest';
import * as GameLogic from '../src/js/game-logic.js';
import { state, resetState } from '../src/js/state.js';
import { tryMove, setMovementHooks } from '../src/js/movement.js';

test('Drill Wear applies hull damage when drilling rock harder than drillPower', () => {
    resetState();
    // Create a 2x2 grid, player at 0,0 moving to 1,0 which is STONE
    state.grid = [
        [GameLogic.TILES.EMPTY, GameLogic.TILES.STONE],
        [GameLogic.TILES.EMPTY, GameLogic.TILES.EMPTY]
    ];
    state.player = { gridX: 0, gridY: 0, drillPower: 1, x: 0, y: 0 };
    state.hull = 100;
    state.maxHull = 100;
    state.fuel = 100;
    state.maxFuel = 100;

    let floatingTextCalled = false;
    setMovementHooks({
        getUpgradeValue: (id) => id === 'reinforcedBits' ? 0 : (id === 'fuelEfficiency' ? 2 : 1),
        showFloatingText: (text) => { 
            if (text.includes('Hull')) floatingTextCalled = true; 
        },
        triggerGameOver: () => {},
        getHullDamageReduction: () => 0
    });

    tryMove(1, 0); // Move to STONE (1,0)
    
    expect(state.hull).toBeLessThan(100);
    expect(floatingTextCalled).toBe(true);
});

test('Per-tile fuel costs are applied correctly for DIRT', () => {
    resetState();
    state.grid = [
        [GameLogic.TILES.EMPTY, GameLogic.TILES.DIRT]
    ];
    state.player = { gridX: 0, gridY: 0, drillPower: 10, x: 0, y: 0 };
    state.fuel = 100;
    state.maxFuel = 100;

    setMovementHooks({
        getUpgradeValue: (id) => id === 'fuelEfficiency' ? 2 : 1, // upgrade level 0 returns base 2
        getHullDamageReduction: () => 0
    });

    tryMove(1, 0);
    // Base DIRT cost is 1.0. Efficiency upgrade level 0 returns 2. 
    // formula: fuelCostBase * (hooks.getUpgradeValue('fuelEfficiency') / GameLogic.FUEL_PER_MOVE) * GameLogic.getDepthFuelMultiplier(depthFracNow);
    // fuelCost = 1.0 * (2 / 2) * 1.0 = 1.0
    expect(state.fuel).toBe(99);
});

test('Per-tile fuel costs are applied correctly for EMPTY', () => {
    resetState();
    state.grid = [
        [GameLogic.TILES.EMPTY, GameLogic.TILES.EMPTY]
    ];
    state.player = { gridX: 0, gridY: 0, drillPower: 10, x: 0, y: 0 };
    state.fuel = 100;
    state.maxFuel = 100;

    setMovementHooks({
        getUpgradeValue: (id) => id === 'fuelEfficiency' ? 2 : 1,
        getHullDamageReduction: () => 0
    });

    tryMove(1, 0);
    // Base EMPTY cost is 0.2
    // fuelCost = 0.2 * (2 / 2) * 1.0 = 0.2
    expect(state.fuel).toBe(99.8);
});
