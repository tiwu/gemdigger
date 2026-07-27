// ── Shop UI & purchase logic ─────────────────────────────────────────────────
import * as GameLogic from './game-logic.js';
import { UPGRADES } from './constants.js';
import { state } from './state.js';
import { sfxShop } from './audio.js';
import * as Tutorial from './tutorial.js';

let shopOverlayEl = null;
export function initShopDom() {
    shopOverlayEl = document.getElementById('shop-overlay');
}

export function getUpgradeValue(id) {
    return GameLogic.getUpgradeValue(id, state.upgradeLevels[id]);
}
export function getHullDamageReduction() { return GameLogic.getHullDamageReduction(state.upgradeLevels.hullPlating); }

export function openShop() {
    if (state.gameOver) return;
    state.shopOpen = true; renderShop(); shopOverlayEl.classList.add('visible');
    Tutorial.triggerHint('shop');
}
export function closeShop() {
    state.shopOpen = false; shopOverlayEl.classList.remove('visible');
    state.player.drillPower = getUpgradeValue('drillPower');
    state.maxFuel = getUpgradeValue('fuelCapacity');
    state.maxHull = getUpgradeValue('hullPlating');
    
    // Always full refill on leaving the shop (since shop is at base/outpost)
    state.fuel = state.maxFuel;
    state.hull = state.maxHull;
}
export function renderShop() {
    const shopScoreEl = document.getElementById('shop-score');
    if (shopScoreEl) shopScoreEl.textContent = state.score;
    const gridEl = document.getElementById('shop-grid'); if (!gridEl) return;
    gridEl.innerHTML = '';
    for (const upg of UPGRADES) {
        const currentLevel = state.upgradeLevels[upg.id];
        const isMaxed = currentLevel >= upg.maxLevel;
        const cost = isMaxed ? 0 : upg.costs[currentLevel+1];
        const canAfford = !isMaxed && state.score >= cost;
        const curVal = GameLogic.getUpgradeValue(upg.id, currentLevel);
        const nextVal = isMaxed ? curVal : GameLogic.getUpgradeValue(upg.id, currentLevel+1);
        const valuesHtml = isMaxed
            ? `<div class="item-values">Current: ${curVal}</div>`
            : `<div class="item-values">${curVal} → ${nextVal}</div>`;
        const div = document.createElement('div');
        div.className = 'shop-item' + ((!canAfford && !isMaxed) ? ' disabled' : '');
        div.innerHTML = `<span class="item-level">${isMaxed?'MAX':`Lv ${currentLevel}/${upg.maxLevel}`}</span>
            <div class="item-name">${upg.name}</div>
            <div class="item-desc">${upg.desc}</div>
            ${valuesHtml}
            <div class="item-cost">${isMaxed?'✅ Maxed out':`Cost: ${cost} pts`}</div>`;

        if (canAfford) div.addEventListener('click', ()=>{ state.score-=cost; state.upgradeLevels[upg.id]++; sfxShop(); renderShop(); });
        gridEl.appendChild(div);
    }

    // Outpost Kit purchase item
    const outCanBuy = GameLogic.canBuyOutpost(state.purchasedOutposts);
    const outCost = GameLogic.getOutpostKitCost(state.purchasedOutposts);
    const outAfford = outCanBuy && state.score >= outCost;
    const outDiv = document.createElement('div');
    outDiv.className = 'shop-item' + ((!outAfford && outCanBuy) ? ' disabled' : '');
    outDiv.innerHTML = `<span class="item-level">${state.purchasedOutposts}/${GameLogic.MAX_OUTPOSTS} bought</span>
        <div class="item-name">🚧 Outpost Kit</div>
        <div class="item-desc">Carry it deep, deploy on cleared ground to refuel without returning to base.</div>
        <div class="item-cost">${outCanBuy?`Cost: ${outCost} pts`:'✅ All kits purchased'}</div>`;
    if (outAfford) outDiv.addEventListener('click', ()=>{
        state.score -= outCost; state.purchasedOutposts++; state.carriedOutposts++;
        sfxShop(); renderShop();
    });
    gridEl.appendChild(outDiv);
}
