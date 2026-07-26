// ── GemDigger main entry point ───────────────────────────────────────────────
// Bootstraps DOM references, wires up modules, and runs the game loop.
import * as GameLogic from './game-logic.js';
const { TILES } = GameLogic;
import { TILE_SIZE, VIEW_TILES_X, VIEW_TILES_Y, GRID_WIDTH, GRID_HEIGHT, MOVE_DELAY } from './constants.js';
import { state, resetState } from './state.js';
import { generateWorld } from './worldgen.js';
import { settings, loadSettings, saveSettings, applyDpadVisibility, applySettingsToUI } from './settings.js';
import {
    getAudioCtx, tryStartMusicOnGesture, sfxHullWarning, sfxLowWarning,
    startBiomeMusic, getCurrentMusicBiomeName, resetCurrentMusicBiomeName,
    playBootJingle
} from './audio.js';
import { loadStats, saveStats, playerStats, checkAchievements, renderAchievements } from './stats.js';
import {
    getLeaderboard, saveLeaderboardEntry, updateLeaderboardEntryName,
    renderLeaderboard, LB_NAME_KEY
} from './leaderboard.js';
import { initShopDom, openShop, closeShop, renderShop, getUpgradeValue, getHullDamageReduction } from './shop.js';
import { tryMove, setMovementHooks, deployOutpost } from './movement.js';
import { initRenderDom, draw } from './render.js';
import { sfxShop } from './audio.js';

// ── DOM references ───────────────────────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const scoreElement = document.getElementById('score');
const depthElement = document.getElementById('depth');
const biomeNameEl = document.getElementById('biome-name');
const comboDisplay = document.getElementById('combo-display');
const inventoryElement = document.getElementById('inventory');
const fuelBar = document.getElementById('fuel-bar');
const hullBar = document.getElementById('hull-bar');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlay-title');
const finalScoreEl = document.getElementById('final-score');
const gemsFoundEl = document.getElementById('gems-found');
const restartBtn = document.getElementById('restart-btn');
const shopOverlayEl = document.getElementById('shop-overlay');
const lbOverlayEl = document.getElementById('leaderboard-overlay');
const settingsOverlayEl = document.getElementById('settings-overlay');
const dpadEl = document.getElementById('dpad');
const screenFlashEl = document.getElementById('screen-flash');

canvas.width = VIEW_TILES_X * TILE_SIZE;
canvas.height = VIEW_TILES_Y * TILE_SIZE;
initRenderDom(canvas);
initShopDom();

function getBiome(depthFrac) { return GameLogic.getBiome(depthFrac); }

// ── Achievements UI wiring ───────────────────────────────────────────────────
document.getElementById('achievements-toggle').addEventListener('click', ()=>{
    renderAchievements();
    document.getElementById('achievements-overlay').style.display = 'flex';
});
document.getElementById('achievements-close-btn').addEventListener('click', ()=>{
    document.getElementById('achievements-overlay').style.display = 'none';
});

// ── Particles ────────────────────────────────────────────────────────────────
function spawnParticles(gx, gy, color, count) {
    const px = gx*TILE_SIZE + TILE_SIZE/2, py = gy*TILE_SIZE + TILE_SIZE/2;
    for (let i=0;i<count;i++) {
        state.particles.push({
            x:px, y:py, vx:(Math.random()-0.5)*4, vy:(Math.random()-0.5)*4 - 1,
            life: 30+Math.random()*20, maxLife: 50, color, size: 2+Math.random()*3
        });
    }
}

// ── Floating Text ──────────────────────────────────────────────────────────
function showFloatingText(text, gridX, gridY, color) {
    state.floatingTexts.push({ text, x:gridX*TILE_SIZE+TILE_SIZE/2, y:gridY*TILE_SIZE, color:color||'#fff', alpha:1.0, vy:-1.2, life:60 });
}

// ── Game Over ────────────────────────────────────────────────────────────────
const HS_KEY = 'gemdigger_highscore';
let currentRunLbId = null;
const lbNameInput = document.getElementById('lb-name-input');
const lbSaveBtn = document.getElementById('lb-save-btn');
const lbSaveConfirm = document.getElementById('lb-save-confirm');

function triggerGameOver(reason) {
    if (state.gameOver) return;
    state.gameOver = true;
    const prevHS = parseInt(localStorage.getItem(HS_KEY)||'0',10);
    const newHS = Math.max(state.score, prevHS);
    localStorage.setItem(HS_KEY, newHS);

    const totalGems = Object.values(state.inventory).reduce((a,b)=>a+b,0);
    const depthMeters = Math.max(0, state.player.gridY-2)*2;
    
    // Clear toast when game over to avoid clutter
    const toastEl = document.getElementById('achievement-toast');
    if (toastEl) toastEl.classList.remove('show');

    const lbId = Date.now() + '-' + Math.floor(Math.random()*100000);
    const savedName = localStorage.getItem(LB_NAME_KEY) || '';
    saveLeaderboardEntry({ id: lbId, name: savedName || 'Anonymous', score: state.score, depth: depthMeters, gems: totalGems, date: new Date().toISOString() });
    currentRunLbId = lbId;
    if (lbNameInput) lbNameInput.value = savedName;
    if (lbSaveConfirm) lbSaveConfirm.textContent = '';
    playerStats.runsCompleted++;
    saveStats();
    checkAchievements();

    overlayTitle.textContent = reason === 'hull' ? '💥 Drill Destroyed!' : '⛽ Out of Fuel!';
    finalScoreEl.textContent = state.score;
    const hsEl = document.getElementById('high-score-display');
    if (hsEl) hsEl.textContent = state.score >= prevHS && state.score > 0 ? '🏆 New High Score!' : `High Score: ${newHS}`;
    const gemList = Object.entries(state.inventory).map(([k,v])=>`${v}x ${k}`).join(', ');
    gemsFoundEl.textContent = gemList ? `Gems collected: ${gemList}` : 'No gems collected.';
    overlay.classList.add('visible');
}

setMovementHooks({
    showFloatingText, spawnParticles, triggerGameOver, openShop,
    getUpgradeValue, getHullDamageReduction, sfxShop, updateUI
});

// ── Init / Reset ─────────────────────────────────────────────────────────────
function init() {
    resetState();
    state.maxFuel = getUpgradeValue('fuelCapacity'); state.fuel = state.maxFuel;
    state.maxHull = getUpgradeValue('hullPlating'); state.hull = state.maxHull;

    const startX = Math.floor(GRID_WIDTH/2), startY = 2;

    state.player = {
        x:startX*TILE_SIZE, y:startY*TILE_SIZE, targetX:startX*TILE_SIZE, targetY:startY*TILE_SIZE,
        gridX:startX, gridY:startY, drillPower:getUpgradeValue('drillPower'), moving:false, facing:'down'
    };
    generateWorld();
    updateUI();
    overlay.classList.remove('visible');
    shopOverlayEl.classList.remove('visible');
}

// ── UI Update ────────────────────────────────────────────────────────────────
function updateUI() {
    scoreElement.textContent = state.score;
    const uiHS = document.getElementById('ui-highscore');
    if (uiHS) uiHS.textContent = Math.max(state.score, parseInt(localStorage.getItem(HS_KEY)||'0',10));

    const depthMeters = Math.max(0, state.player.gridY-2)*2;
    depthElement.textContent = depthMeters;
    const depthFrac = (state.player.gridY-2)/(GRID_HEIGHT-3);
    biomeNameEl.textContent = getBiome(Math.max(0,depthFrac)).name;
    if (depthMeters > playerStats.maxDepth) {
        playerStats.maxDepth = depthMeters;
        saveStats();
        checkAchievements();
    }

    if (state.comboCount > 1) comboDisplay.textContent = `🔥 Combo x${state.comboCount} (${state.comboMultiplier.toFixed(1)}x)`;
    else comboDisplay.textContent = '';

    const fuelPct = (state.fuel/state.maxFuel)*100; fuelBar.style.width = Math.max(0, fuelPct)+'%';
    fuelBar.style.background = fuelPct>50?'#2ecc71':fuelPct>25?'#f39c12':'#e74c3c';
    fuelBar.classList.toggle('pulse', fuelPct <= 20 && fuelPct > 0);
    const hullPct = (state.hull/state.maxHull)*100; hullBar.style.width = hullPct+'%';
    hullBar.style.background = hullPct>50?'#3498db':hullPct>25?'#e67e22':'#c0392b';
    hullBar.classList.toggle('pulse', hullPct <= 25 && hullPct > 0);

    const gemList = Object.entries(state.inventory).map(([k,v])=>`${v}x ${k}`).join(', ');
    inventoryElement.textContent = 'Gems: '+(gemList||'None');

    const outpostStatEl = document.getElementById('outpost-stat');
    if (outpostStatEl) outpostStatEl.textContent = `🚧 Outposts: ${state.carriedOutposts} carried, ${state.placedOutposts} placed`;

    const deployBtn = document.getElementById('deploy-outpost-btn');
    if (deployBtn) {
        const canDeploy = GameLogic.canPlaceOutpost(state.grid[state.player.gridY][state.player.gridX], state.carriedOutposts, state.placedOutposts);
        deployBtn.style.display = canDeploy ? 'block' : 'none';
    }
}
document.getElementById('deploy-outpost-btn').addEventListener('click', deployOutpost);

// ── Low-Fuel / Hull Warnings ─────────────────────────────────────────────────
let lowFuelTimer = 0, lastHullWarnThreshold = 100;
function screenFlash() {
    screenFlashEl.classList.add('active');
    setTimeout(()=>screenFlashEl.classList.remove('active'), 150);
}

// ── Update Loop ──────────────────────────────────────────────────────────────
function update() {
    if (state.gameOver || state.shopOpen || state.settingsOpen) return;

    if (state.moveTimer > 0) state.moveTimer--;
    else {
        if (state.keys["arrowup"] || state.keys["w"]) { tryMove(0,-1); state.moveTimer=MOVE_DELAY; }
        if (state.keys["arrowdown"] || state.keys["s"]) { tryMove(0,1); state.moveTimer=MOVE_DELAY; }
        if (state.keys["arrowleft"] || state.keys["a"]) { tryMove(-1,0); state.moveTimer=MOVE_DELAY; }
        if (state.keys["arrowright"] || state.keys["d"]) { tryMove(1,0); state.moveTimer=MOVE_DELAY; }
    }

    const SPEED = getUpgradeValue('moveSpeed');
    const player = state.player;
    if (player.x !== player.targetX) {
        const dir = player.targetX>player.x?1:-1; player.x += dir*SPEED;
        if (Math.abs(player.targetX-player.x)<=SPEED) player.x = player.targetX;
    }
    if (player.y !== player.targetY) {
        const dir = player.targetY>player.y?1:-1; player.y += dir*SPEED;
        if (Math.abs(player.targetY-player.y)<=SPEED) player.y = player.targetY;
    }
    if (player.x===player.targetX && player.y===player.targetY) player.moving=false;

    if (state.comboTimer > 0) { state.comboTimer--; if (state.comboTimer===0) { state.comboCount=0; state.comboMultiplier=1; } }

    // Low-fuel warning sfx - urgency scales as fuel approaches empty
    if (state.fuel > 0 && state.fuel/state.maxFuel <= 0.2) {
        lowFuelTimer--;
        if (lowFuelTimer <= 0) {
            const fuelFrac = Math.max(0, state.fuel/state.maxFuel) / 0.2;
            const interval = Math.round(20 + fuelFrac*70);
            const pitch = 220 + (1-fuelFrac)*220;
            sfxLowWarning(pitch);
            lowFuelTimer = interval;
        }
    } else { lowFuelTimer = 0; }

    // Hull damage threshold sfx + screen flash (crossing 50%/25%)
    const hullPct = state.hull/state.maxHull*100;
    if (hullPct <= 50 && lastHullWarnThreshold > 50) { sfxHullWarning(); screenFlash(); }
    if (hullPct <= 25 && lastHullWarnThreshold > 25) { sfxHullWarning(); screenFlash(); }
    lastHullWarnThreshold = hullPct;

    // Update particles
    state.particles = state.particles.filter(p=>p.life>0);
    for (const p of state.particles) { p.x+=p.vx; p.y+=p.vy; p.vy+=0.15; p.life--; }

    updateUI();
}

function gameLoop() { update(); draw(); requestAnimationFrame(gameLoop); }

// ── Sound toggle (Master Mute) ───────────────────────────────────────────────
document.getElementById('sound-toggle').addEventListener('click', function() {
    const isMuted = !settings.sfx && !settings.music;
    if (isMuted) {
        settings.sfx = true;
        settings.music = true;
    } else {
        settings.sfx = false;
        settings.music = false;
    }
    state.soundEnabled = settings.sfx;
    applySettingsToUI();
    saveSettings();
    if (settings.music) {
        resetCurrentMusicBiomeName();
        updateMusicForBiome();
    }
});

window.addEventListener('keydown', tryStartMusicOnGesture);
window.addEventListener('mousedown', tryStartMusicOnGesture);
window.addEventListener('touchstart', tryStartMusicOnGesture);

// ── Leaderboard UI ───────────────────────────────────────────────────────────
document.getElementById('lb-toggle').addEventListener('click', async ()=>{
    const lb = await import('./leaderboard.js').then(m=>m.fetchRemoteLeaderboard());
    renderLeaderboard(lb);
    lbOverlayEl.classList.add('visible');
});
document.getElementById('overlay-lb-btn').addEventListener('click', async ()=>{
    const { fetchRemoteLeaderboard } = await import('./leaderboard.js');
    const lb = await fetchRemoteLeaderboard();
    renderLeaderboard(lb);
    lbOverlayEl.classList.add('visible');
});
document.getElementById('lb-close-btn').addEventListener('click', ()=>{ lbOverlayEl.classList.remove('visible'); });

if (lbNameInput) lbNameInput.value = localStorage.getItem(LB_NAME_KEY) || '';
if (lbSaveBtn) {
    lbSaveBtn.addEventListener('click', ()=>{
        const name = (lbNameInput.value || '').trim().slice(0,16) || 'Anonymous';
        localStorage.setItem(LB_NAME_KEY, name);
        if (currentRunLbId) {
            updateLeaderboardEntryName(currentRunLbId, name);
            lbSaveConfirm.textContent = '✅ Saved!';
            setTimeout(()=>{ lbSaveConfirm.textContent = ''; }, 2000);
        }
    });
}

// ── Settings Overlay Controls ────────────────────────────────────────────────
function openSettings() { state.settingsOpen = true; applySettingsToUI(); settingsOverlayEl.classList.add('visible'); }
function closeSettings() { state.settingsOpen = false; settingsOverlayEl.classList.remove('visible'); }
document.getElementById('settings-toggle').addEventListener('click', openSettings);
document.getElementById('settings-close-btn').addEventListener('click', closeSettings);
document.getElementById('setting-dpad').addEventListener('change', function(){ settings.dpad = this.checked; applyDpadVisibility(); saveSettings(); });
document.getElementById('setting-sfx').addEventListener('change', function(){ settings.sfx = this.checked; state.soundEnabled = settings.sfx; document.getElementById('sound-toggle').textContent = state.soundEnabled?'🔊':'🔇'; saveSettings(); });
document.getElementById('setting-sfx-vol').addEventListener('input', function(){ settings.sfxVol = parseFloat(this.value); saveSettings(); });
document.getElementById('setting-music').addEventListener('change', function(){ settings.music = this.checked; saveSettings(); if (settings.music) { resetCurrentMusicBiomeName(); updateMusicForBiome(); } });
document.getElementById('setting-music-vol').addEventListener('input', function(){ settings.musicVol = parseFloat(this.value); saveSettings(); });

document.getElementById('shop-close-btn').addEventListener('click', closeShop);

// ── Input ────────────────────────────────────────────────────────────────────
let shopHighlightIndex = 0;
window.addEventListener('keydown', (e)=>{
    const key = e.key.toLowerCase();

    if (overlay.classList.contains('visible')) {
        if (key === 'enter' || key === ' ') { e.preventDefault(); init(); return; }
        if (key === 'l') { e.preventDefault(); renderLeaderboard(getLeaderboard()); lbOverlayEl.classList.add('visible'); return; }
        if (key === 'h' || key === '?') { e.preventDefault(); openTutorial(); return; }
        if (key === 'c') { e.preventDefault(); openChangelog(); return; }
        return;
    }
    if (lbOverlayEl.classList.contains('visible')) {
        if (key === 'enter' || key === 'escape') { e.preventDefault(); lbOverlayEl.classList.remove('visible'); }
        return;
    }
    if (settingsOverlayEl.classList.contains('visible')) {
        if (key === 'escape' || key === 'enter') { e.preventDefault(); closeSettings(); }
        return;
    }
    if (changelogOverlayEl && changelogOverlayEl.classList.contains('visible')) {
        if (key === 'escape' || key === 'enter') { e.preventDefault(); closeChangelog(); }
        return;
    }
    if (shopOverlayEl.classList.contains('visible')) {
        const items = document.querySelectorAll('#shop-grid .shop-item');
        if (key === 'arrowright' || key === 'arrowdown') {
            e.preventDefault();
            shopHighlightIndex = (shopHighlightIndex+1) % items.length;
            items.forEach((it,i)=>it.classList.toggle('highlighted', i===shopHighlightIndex));
        } else if (key === 'arrowleft' || key === 'arrowup') {
            e.preventDefault();
            shopHighlightIndex = (shopHighlightIndex-1+items.length) % items.length;
            items.forEach((it,i)=>it.classList.toggle('highlighted', i===shopHighlightIndex));
        } else if (key === 'enter' || key === ' ') {
            e.preventDefault();
            const item = items[shopHighlightIndex];
            if (item) item.click();
        } else if (key === 'escape') {
            e.preventDefault(); closeShop();
        }
        return;
    }

    if (['arrowup','arrowdown','arrowleft','arrowright', 'w', 'a', 's', 'd'].includes(key)) {
        e.preventDefault();
        if (!state.keys[key]) { state.keys[key]=true; state.moveTimer=0; } else state.keys[key]=true;
    }
    if (key === 'e') { e.preventDefault(); deployOutpost(); }
});

window.addEventListener('keyup', (e)=>{
    const key = e.key.toLowerCase();
    state.keys[key]=false;
    const anyHeld = ['arrowup','arrowdown','arrowleft','arrowright', 'w', 'a', 's', 'd'].some(k=>state.keys[k]);
    if (!anyHeld) state.moveTimer=0;
});
restartBtn.addEventListener('click', ()=>{ init(); });

// ── Changelog Modal ──────────────────────────────────────────────────────────
const changelogOverlayEl = document.getElementById('changelog-overlay');
function openChangelog() { changelogOverlayEl.style.display = 'flex'; }
function closeChangelog() { changelogOverlayEl.style.display = 'none'; }
document.getElementById('changelog-toggle').addEventListener('click', openChangelog);
document.getElementById('changelog-close-btn').addEventListener('click', closeChangelog);

window.addEventListener("blur", ()=>{ if (settings.music) getAudioCtx().suspend(); });
window.addEventListener("focus", ()=>{ if (settings.music) getAudioCtx().resume(); });

const dpadBtnMap = { "dpad-up":[0,-1], "dpad-down":[0,1], "dpad-left":[-1,0], "dpad-right":[1,0] };
let touchInterval = null;
Object.entries(dpadBtnMap).forEach(([id,dir])=>{
    const btn = document.getElementById(id); if (!btn) return;
    const startMove = ()=>{ tryMove(...dir); touchInterval = setInterval(()=>tryMove(...dir), 150); };
    const stopMove = ()=>{ clearInterval(touchInterval); touchInterval=null; };
    btn.addEventListener("touchstart", (e)=>{ e.preventDefault(); startMove(); }, {passive:false});
    btn.addEventListener("touchend", stopMove);
    btn.addEventListener("mousedown", startMove);
    btn.addEventListener("mouseup", stopMove);
    btn.addEventListener("mouseleave", stopMove);
});

// ── Biome music update ───────────────────────────────────────────────────────
function updateMusicForBiome() {
    if (!settings.music) return;
    const depthFrac = Math.max(0,(state.player.gridY-2)/(GRID_HEIGHT-3));
    const biomeName = getBiome(depthFrac).name;
    if (biomeName !== getCurrentMusicBiomeName()) {
        startBiomeMusic(biomeName);
    }
}

// ── Tutorial Modal ───────────────────────────────────────────────────────────
const TUTORIAL_KEY = "gemdigger_tutorial_seen";
const tutorialOverlayEl = document.getElementById("tutorial-overlay");
function openTutorial() { tutorialOverlayEl.style.display = "flex"; }
function closeTutorial() { tutorialOverlayEl.style.display = "none"; localStorage.setItem(TUTORIAL_KEY, "1"); }
document.getElementById("tutorial-close-btn").addEventListener("click", closeTutorial);
document.getElementById("help-toggle").addEventListener("click", openTutorial);
if (!localStorage.getItem(TUTORIAL_KEY)) openTutorial();

// ── Retro Boot Screen ────────────────────────────────────────────────────────
const bootScreenEl = document.getElementById('boot-screen');
const bootLoadbarFill = document.getElementById('boot-loadbar-fill');
const bootPressStart = document.getElementById('boot-press-start');
let bootComplete = false;

function dismissBootScreen() {
    if (!bootComplete) return;
    bootScreenEl.style.display = 'none';
    window.removeEventListener('keydown', dismissBootScreen);
    window.removeEventListener('mousedown', dismissBootScreen);
    window.removeEventListener('touchstart', dismissBootScreen);
    
    // Unlock music if enabled
    if (settings.music) {
        tryStartMusicOnGesture();
        updateMusicForBiome();
    }
}

function handleBootGesture() {
    if (!bootComplete) return;
    playBootJingle();
    dismissBootScreen();
}

// Initial boot sequence
setTimeout(()=>{ 
    bootLoadbarFill.style.width = '100%'; 
    setTimeout(() => {
        bootComplete = true;
        if (bootPressStart) bootPressStart.style.display = 'block';
    }, 1500);
}, 50);

window.addEventListener('keydown', handleBootGesture);
window.addEventListener('mousedown', handleBootGesture);
window.addEventListener('touchstart', handleBootGesture);

// ── Versioning ───────────────────────────────────────────────────────────────
const appVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0';
const bootVerEl = document.getElementById('boot-version');
if (bootVerEl) bootVerEl.textContent = `v${appVersion}`;
const setVerEl = document.getElementById('settings-version');
if (setVerEl) setVerEl.textContent = appVersion;

// ── Boot ─────────────────────────────────────────────────────────────────────
loadStats();
loadSettings();
init();
gameLoop();
setInterval(updateMusicForBiome, 500);
