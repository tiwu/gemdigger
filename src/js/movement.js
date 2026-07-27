// ── Movement / Mining logic ──────────────────────────────────────────────────
import * as GameLogic from './game-logic.js';
const { TILES } = GameLogic;
import {
    TILE_SIZE, GRID_WIDTH, GRID_HEIGHT, FUEL_CANISTER_AMOUNT,
    LAVA_FUEL_DAMAGE, LAVA_HULL_DAMAGE, CAVEIN_HULL_DAMAGE,
    GEM_REWARDS, GEM_NAMES, TILE_COLORS
} from './constants.js';
import { state } from './state.js';
import { playerStats, saveStats, checkAchievements } from './stats.js';
import { sfxDig, sfxGem, sfxFuel, sfxLava, sfxCavein, sfxLegendary } from './audio.js';
import * as Tutorial from './tutorial.js';

// Callbacks injected by main.js to avoid circular imports with ui/render/shop modules.
let hooks = {
    showFloatingText: () => {},
    spawnParticles: () => {},
    triggerGameOver: () => {},
    openShop: () => {},
    getUpgradeValue: () => 0,
    getHullDamageReduction: () => 0,
};
export function setMovementHooks(h) { Object.assign(hooks, h); }

export function registerGemHit() {
    state.comboCount++;
    state.comboMultiplier = GameLogic.computeComboMultiplier(state.comboCount);
    state.comboTimer = 180;
}
export function resetCombo() { state.comboCount = 0; state.comboMultiplier = 1; state.comboTimer = 0; }

export function tryMove(dx, dy) {
    if (state.gameOver || state.player.moving) return;
    const player = state.player, grid = state.grid;
    const newGridX = player.gridX+dx, newGridY = player.gridY+dy;
    if (newGridX<0||newGridX>=GRID_WIDTH||newGridY<0||newGridY>=GRID_HEIGHT) return;
    const targetTile = grid[newGridY][newGridX];
    if (targetTile === TILES.BEDROCK) return;

    const depthFracNow = Math.max(0, (player.gridY-2)/(GRID_HEIGHT-3));
    const { BALANCE } = GameLogic;
    let fuelCostBase = BALANCE.FUEL_COSTS.EMPTY;
    if (targetTile === TILES.DIRT) fuelCostBase = BALANCE.FUEL_COSTS.DIRT;
    else if (targetTile === TILES.STONE) fuelCostBase = BALANCE.FUEL_COSTS.STONE;
    else if (GameLogic.GEM_TILES.includes(targetTile)) fuelCostBase = BALANCE.FUEL_COSTS.GEMS;
    else if (targetTile === TILES.FUEL) fuelCostBase = BALANCE.FUEL_COSTS.FUEL;
    else if (targetTile === TILES.LAVA || targetTile === TILES.UNSTABLE) fuelCostBase = BALANCE.FUEL_COSTS.HAZARD;

    // Apply Hard Rock fuel penalty if drill power is too low
    const toughness = targetTile === TILES.STONE ? GameLogic.getStoneToughness(GameLogic.getBiome(depthFracNow)) : 1;
    if (player.drillPower < toughness) fuelCostBase = BALANCE.FUEL_COSTS.HARD_ROCK;

    let fuelCost = fuelCostBase * (hooks.getUpgradeValue('fuelEfficiency') / GameLogic.FUEL_PER_MOVE) * GameLogic.getDepthFuelMultiplier(depthFracNow);
    if (state.fuel <= 0) { hooks.triggerGameOver('fuel'); return; }

    if (dx>0) player.facing='right'; else if (dx<0) player.facing='left';
    else if (dy>0) player.facing='down'; else if (dy<0) player.facing='up';

    const isGem = GameLogic.GEM_TILES.includes(targetTile);

    if (state.fuel / state.maxFuel < 0.6) {
        Tutorial.triggerHint('low_fuel');
    }

    if (targetTile !== TILES.EMPTY) {
        if (targetTile === TILES.LAVA) {
            Tutorial.triggerHint('hazard');
            const dmgReduction = hooks.getHullDamageReduction();
            const hazardMult = GameLogic.getDepthHazardMultiplier(depthFracNow);
            const lavaHullDmg = Math.round(LAVA_HULL_DAMAGE * hazardMult);
            state.fuel = Math.max(0, state.fuel - LAVA_FUEL_DAMAGE);
            state.hull = Math.max(0, state.hull - lavaHullDmg*(1-dmgReduction));
            hooks.showFloatingText(`-${LAVA_FUEL_DAMAGE} Fuel / -Hull!`, newGridX, newGridY, '#e74c3c');
            hooks.spawnParticles(newGridX, newGridY, '#ff6600', 10);
            sfxLava();
            resetCombo();
            if (state.fuel<=0) hooks.triggerGameOver('fuel');
            else if (state.hull<=0) hooks.triggerGameOver('hull');
            return;
        }

        const toughness = targetTile === TILES.STONE ? GameLogic.getStoneToughness(GameLogic.getBiome(depthFracNow)) : 1;
        if (player.drillPower < toughness) {
            // Drill Wear: Drilling rock harder than your drill costs Hull
            Tutorial.triggerHint('hard_rock');
            const wearDamage = BALANCE.DRILL_WEAR_BASE_DAMAGE * (toughness - player.drillPower);
            const bitsLevel = hooks.getUpgradeValue('reinforcedBits');
            const reducedDamage = wearDamage * (1 - (bitsLevel * BALANCE.REINFORCED_BITS_REDUCTION));
            state.hull = Math.max(0, state.hull - reducedDamage);
            hooks.showFloatingText(`-Hull (Drill Wear)!`, newGridX, newGridY, '#e74c3c');
            if (state.hull <= 0) { hooks.triggerGameOver('hull'); return; }
        }

        if (isGem) {
            registerGemHit();
            Tutorial.triggerHint('gem_found');
            const gemName = GEM_NAMES[targetTile];
            const baseReward = GEM_REWARDS[targetTile];
            const reward = GameLogic.computeReward(baseReward, state.comboMultiplier);
            state.score += reward;
            state.inventory[gemName] = (state.inventory[gemName]||0)+1;
            const rarity = targetTile===TILES.UNOBTAINIUM?6:targetTile===TILES.SAPPHIRE?4:targetTile===TILES.DIAMOND?3:targetTile===TILES.EMERALD?2:targetTile===TILES.RUBY?1:0;
            sfxGem(rarity);
            hooks.spawnParticles(newGridX, newGridY, TILE_COLORS[targetTile], targetTile===TILES.UNOBTAINIUM?30:12);
            const comboTxt = state.comboMultiplier>1 ? ` (${state.comboMultiplier.toFixed(1)}x)` : '';
            hooks.showFloatingText(`+${reward}${comboTxt}`, newGridX, newGridY, targetTile===TILES.UNOBTAINIUM?'#ffdd00':'#fff');

            if (targetTile === TILES.UNOBTAINIUM) {
                state.unobtainiumFound = true;
                state.unobtainiumInRun++;
                playerStats.unobtainiumFound++;
                sfxLegendary();
                hooks.showFloatingText('LEGENDARY!!!', newGridX, newGridY-1, '#ffdd00');
            }
            playerStats.totalGems++;
            saveStats();
            checkAchievements();

        } else {
            hooks.spawnParticles(newGridX, newGridY, targetTile===TILES.STONE?'#6b7280':'#8b4513', 6);
            sfxDig();
        }

        if (targetTile === TILES.FUEL) {
            state.fuel = Math.min(state.maxFuel, state.fuel + FUEL_CANISTER_AMOUNT);
            hooks.showFloatingText('+Fuel', newGridX, newGridY, '#e67e22');
            sfxFuel();
        }

        if (targetTile === TILES.BASE) {
            state.fuel = Math.max(0, state.fuel - fuelCost);
            state.fuel = state.maxFuel; state.hull = state.maxHull;
            hooks.showFloatingText('Refuelled!', newGridX, newGridY, '#2ecc71');

            if (Object.keys(state.inventory).length > 0) {
                Tutorial.triggerHint('at_base');
            }
            player.moving = true;
            player.targetX = newGridX*TILE_SIZE; player.targetY = newGridY*TILE_SIZE;
            player.gridX = newGridX; player.gridY = newGridY;
            setTimeout(hooks.openShop, 300);
            return;
        }

        if (targetTile === TILES.OUTPOST) {
            state.fuel = Math.max(0, state.fuel - fuelCost);
            const key = newGridX+','+newGridY;
            const lastUsed = state.outpostLastUsed[key];
            if (GameLogic.canUseOutpost(lastUsed, Date.now())) {
                state.fuel = state.maxFuel; state.hull = state.maxHull;
                state.outpostLastUsed[key] = Date.now();
                hooks.showFloatingText('Outpost Refuel!', newGridX, newGridY, '#f39c12');
                sfxFuel();
            } else {
                const remainingS = Math.ceil(GameLogic.getOutpostCooldownRemaining(lastUsed, Date.now())/1000);
                hooks.showFloatingText(`Cooling down (${remainingS}s)`, newGridX, newGridY, '#95a5a6');
            }
            player.moving = true;
            player.targetX = newGridX*TILE_SIZE; player.targetY = newGridY*TILE_SIZE;
            player.gridX = newGridX; player.gridY = newGridY;
            if (state.fuel<=0) setTimeout(()=>hooks.triggerGameOver('fuel'),400);
            return;
        }

        if (targetTile === TILES.UNSTABLE) {
            grid[newGridY][newGridX] = TILES.EMPTY;
            hooks.showFloatingText('Cave-in!', newGridX, newGridY, '#e67e22');

            hooks.spawnParticles(newGridX, newGridY, '#a0522d', 14);
            sfxCavein();
            resetCombo();
            triggerCaveIn(newGridX, newGridY);
            state.fuel = Math.max(0, state.fuel - fuelCost);
            player.moving = true;
            player.targetX = newGridX*TILE_SIZE; player.targetY = newGridY*TILE_SIZE;
            player.gridX = newGridX; player.gridY = newGridY;
            if (state.fuel<=0) setTimeout(()=>hooks.triggerGameOver('fuel'),400);
            return;
        }

        grid[newGridY][newGridX] = TILES.EMPTY;
    } else {
        // Moving through empty space breaks combo streak
        if (state.comboCount > 0) resetCombo();
    }

    state.fuel = Math.max(0, state.fuel - fuelCost);
    player.moving = true;
    player.targetX = newGridX*TILE_SIZE; player.targetY = newGridY*TILE_SIZE;
    player.gridX = newGridX; player.gridY = newGridY;
    if (state.fuel<=0) setTimeout(()=>hooks.triggerGameOver('fuel'),400);
}

export function triggerCaveIn(cx, cy) {
    const grid = state.grid, player = state.player;
    const radius = 2, collapseTargets = [];
    for (let dy=-radius; dy<=radius; dy++) for (let dx=-radius; dx<=radius; dx++) {
        if (dx===0&&dy===0) continue;
        const nx=cx+dx, ny=cy+dy;
        if (nx<1||nx>=GRID_WIDTH-1||ny<2||ny>=GRID_HEIGHT-1) continue;
        if (grid[ny][nx] === TILES.EMPTY) collapseTargets.push({x:nx,y:ny});
    }
    const toCollapse = collapseTargets.sort(()=>Math.random()-0.5).slice(0, Math.floor(collapseTargets.length*0.4));
    setTimeout(()=>{
        for (const t of toCollapse) {
            if (t.x===player.gridX && t.y===player.gridY) {
                const dmgReduction = hooks.getHullDamageReduction();
                const depthFracHere = Math.max(0, (t.y-2)/(GRID_HEIGHT-3));
                const hazardMult = GameLogic.getDepthHazardMultiplier(depthFracHere);
                const caveinDmg = Math.round(CAVEIN_HULL_DAMAGE * hazardMult);
                state.hull = Math.max(0, state.hull - caveinDmg*(1-dmgReduction));
                hooks.showFloatingText('-Hull!', t.x, t.y, '#e74c3c');
                if (state.hull<=0) hooks.triggerGameOver('hull');
                continue;
            }
            if (grid[t.y][t.x] === TILES.EMPTY) grid[t.y][t.x] = TILES.DIRT;
        }
    }, 500);
}

export function deployOutpost() {
    if (state.gameOver || state.shopOpen || state.settingsOpen) return;
    const player = state.player;
    const tile = state.grid[player.gridY][player.gridX];
    if (!GameLogic.canPlaceOutpost(tile, state.carriedOutposts, state.placedOutposts)) return;
    state.grid[player.gridY][player.gridX] = TILES.OUTPOST;
    state.carriedOutposts--; state.placedOutposts++;
    hooks.showFloatingText('Outpost Deployed!', player.gridX, player.gridY, '#f39c12');
    // sfxShop imported lazily via hooks to avoid needless coupling
    if (hooks.sfxShop) hooks.sfxShop();
    if (hooks.updateUI) hooks.updateUI();
}
