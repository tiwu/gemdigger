import { expect, test, describe } from 'vitest';
import * as GameLogic from '../src/js/game-logic.js';
import { state, resetState } from '../src/js/state.js';
import { tryMove, setMovementHooks } from '../src/js/movement.js';

describe('v3 Mechanics - Drill Wear & Fuel', () => {
    
    test('Drill Wear applies hull damage when drilling rock harder than drillPower', () => {
        resetState();
        state.grid = [
            [GameLogic.TILES.EMPTY, GameLogic.TILES.STONE]
        ];
        state.player = { gridX: 0, gridY: 0, drillPower: 1, x: 0, y: 0 };
        state.hull = 100;
        state.maxHull = 100;
        state.fuel = 100;

        setMovementHooks({
            getUpgradeValue: (id) => id === 'reinforcedBits' ? 0 : (id === 'fuelEfficiency' ? 2 : 1),
            showFloatingText: () => {},
            triggerGameOver: () => {},
            getHullDamageReduction: () => 0
        });

        tryMove(1, 0); 
        
        expect(state.hull).toBeLessThan(100);
        // Base damage is 5, diff is 3-1=2. 5 * 2 = 10 damage.
        expect(state.hull).toBe(90);
    });

    test('Reinforced Bits reduces hull damage from Drill Wear', () => {
        resetState();
        state.grid = [[GameLogic.TILES.EMPTY, GameLogic.TILES.STONE]];
        state.player = { gridX: 0, gridY: 0, drillPower: 1, x: 0, y: 0 };
        state.hull = 100;

        setMovementHooks({
            getUpgradeValue: (id) => id === 'reinforcedBits' ? 1 : (id === 'fuelEfficiency' ? 2 : 1),
            showFloatingText: () => {},
            triggerGameOver: () => {},
            getHullDamageReduction: () => 0
        });

        tryMove(1, 0); 
        
        // Base damage 10. Level 1 reinforced bits = 20% reduction.
        // 10 * (1 - 0.2) = 8 damage.
        expect(state.hull).toBe(92);
    });

    test('Per-tile fuel costs are applied correctly for DIRT', () => {
        resetState();
        state.grid = [[GameLogic.TILES.EMPTY, GameLogic.TILES.DIRT]];
        state.player = { gridX: 0, gridY: 0, drillPower: 10, x: 0, y: 0 };
        state.fuel = 100;

        setMovementHooks({
            getUpgradeValue: (id) => id === 'fuelEfficiency' ? 2 : 1,
            getHullDamageReduction: () => 0
        });

        tryMove(1, 0);
        expect(state.fuel).toBe(99); // 100 - 1.0
    });

    test('Drilling tough rock with weak drill costs HARD_ROCK fuel (5.0)', () => {
        resetState();
        state.grid = [[GameLogic.TILES.EMPTY, GameLogic.TILES.STONE]];
        state.player = { gridX: 0, gridY: 0, drillPower: 1, x: 0, y: 0 }; // Stone toughness is 3
        state.fuel = 100;

        setMovementHooks({
            getUpgradeValue: (id) => id === 'fuelEfficiency' ? 2 : 1,
            getHullDamageReduction: () => 0,
            showFloatingText: () => {}
        });

        tryMove(1, 0);
        // Cost should be 5.0 instead of normal Stone 3.0
        expect(state.fuel).toBe(95);
    });

    test('Fuel costs scale with depth multiplier', () => {
        resetState();
        // Deep layer (depth fraction ~1.0)
        state.grid = new Array(200).fill(0).map(() => new Array(80).fill(GameLogic.TILES.EMPTY));
        state.grid[190][5] = GameLogic.TILES.DIRT;
        state.player = { gridX: 4, gridY: 190, drillPower: 10, x: 0, y: 0 };
        state.fuel = 100;

        setMovementHooks({
            getUpgradeValue: (id) => id === 'fuelEfficiency' ? 2 : 1,
            getHullDamageReduction: () => 0
        });

        const depthFrac = (190-2)/(200-3); // ~0.95
        const expectedMult = 1 + depthFrac * 1.6; // ~2.52
        const expectedCost = 1.0 * expectedMult;

        tryMove(1, 0);
        expect(state.fuel).toBeCloseTo(100 - expectedCost, 5);
    });

    test('Empty tiles consume very little fuel (0.2)', () => {
        resetState();
        state.grid = [[GameLogic.TILES.EMPTY, GameLogic.TILES.EMPTY]];
        state.player = { gridX: 0, gridY: 0, drillPower: 10, x: 0, y: 0 };
        state.fuel = 100;

        setMovementHooks({
            getUpgradeValue: (id) => id === 'fuelEfficiency' ? 2 : 1,
            getHullDamageReduction: () => 0
        });

        tryMove(1, 0);
        expect(state.fuel).toBe(99.8);
    });
});
test('Fuel efficiency upgrade properly reduces fuel costs', () => {
    resetState();
    state.grid = [[GameLogic.TILES.EMPTY, GameLogic.TILES.DIRT]];
    state.player = { gridX: 0, gridY: 0, drillPower: 10, x: 0, y: 0 };
    state.fuel = 100;

    setMovementHooks({
        // Level 3 fuel efficiency returns 0.8
        getUpgradeValue: (id) => id === 'fuelEfficiency' ? 0.8 : 1,
        getHullDamageReduction: () => 0
    });

    tryMove(1, 0);
    // Cost = Base(1.0) * (0.8 / 2) * 1.0 = 0.4
    expect(state.fuel).toBe(99.6);
});
