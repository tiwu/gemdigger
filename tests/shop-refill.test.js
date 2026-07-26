import { describe, it, expect, beforeEach, vi } from 'vitest';
import { state, resetState } from '../src/js/state.js';
import { closeShop, initShopDom } from '../src/js/shop.js';

// Mock DOM elements needed for shop.js
const mockEl = {
    classList: { remove: vi.fn(), add: vi.fn() },
    textContent: '',
    innerHTML: ''
};
vi.stubGlobal('document', {
    getElementById: vi.fn().mockReturnValue(mockEl)
});

describe('Shop Refill Logic', () => {
    beforeEach(() => {
        resetState();
        initShopDom();
    });

    it('should fully refill fuel and hull on closeShop', () => {
        state.maxFuel = 200;
        state.fuel = 50;
        state.maxHull = 100;
        state.hull = 20;
        state.upgradeLevels = {
            drillPower: 0,
            moveSpeed: 0,
            fuelEfficiency: 0,
            fuelCapacity: 0,
            hullPlating: 0
        };

        closeShop();

        expect(state.fuel).toBe(200);
        expect(state.hull).toBe(100);
    });

    it('should refill to new capacity after upgrade', () => {
        // Initial state
        state.maxFuel = 200;
        state.fuel = 50;
        state.upgradeLevels = {
            drillPower: 0,
            moveSpeed: 0,
            fuelEfficiency: 0,
            fuelCapacity: 1, // Upgraded level
            hullPlating: 0
        };

        // Note: In real game, getUpgradeValue would return the new max. 
        // For this test, we simulate that state.maxFuel was updated in closeShop
        // because closeShop calls getUpgradeValue internally.
        
        closeShop();

        // Level 1 fuel capacity is 250 (based on game-logic default scaling)
        expect(state.fuel).toBe(250); 
    });
});
