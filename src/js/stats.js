// ── Persistent Player Stats & Achievements ──────────────────────────────────
import * as GameLogic from './game-logic.js';
import { state } from './state.js';
import { sfxLegendary } from './audio.js';

export const STATS_KEY = 'gemdigger_stats';
export const ACH_KEY = 'gemdigger_achievements';

export let playerStats = { maxDepth:0, totalGems:0, unobtainiumFound:0, runsCompleted:0 };

export function loadStats() {
    try { Object.assign(playerStats, JSON.parse(localStorage.getItem(STATS_KEY)||'null')||{}); } catch(e) {}
}
export function saveStats() { localStorage.setItem(STATS_KEY, JSON.stringify(playerStats)); }

export function getUnlockedAchievements() {
    try { return JSON.parse(localStorage.getItem(ACH_KEY)||'[]'); } catch(e) { return []; }
}
export function saveUnlockedAchievements(ids) { localStorage.setItem(ACH_KEY, JSON.stringify(ids)); }

let toastQueue = [], toastShowing = false;

export function checkAchievements(onToast) {
    const unlocked = getUnlockedAchievements();
    const stats = {
        maxDepth: playerStats.maxDepth, totalGems: playerStats.totalGems,
        unobtainiumFound: playerStats.unobtainiumFound, unobtainiumInRun: state.unobtainiumInRun,
        runsCompleted: playerStats.runsCompleted
    };
    const newly = GameLogic.evaluateAchievements(stats, unlocked);
    if (newly.length) {
        for (const ach of newly) {
            unlocked.push(ach.id);
            state.score += ach.reward;
            showAchievementToast(ach);
        }
        saveUnlockedAchievements(unlocked);
    }
    return newly;
}

export function showAchievementToast(ach) {
    toastQueue.push(ach);
    if (!toastShowing) processToastQueue();
}
function processToastQueue() {
    if (toastQueue.length === 0) { toastShowing = false; return; }
    toastShowing = true;
    const ach = toastQueue.shift();
    const toastEl = document.getElementById('achievement-toast');
    if (!toastEl) { setTimeout(processToastQueue, 0); return; }
    document.getElementById('toast-name').textContent = ach.name;
    document.getElementById('toast-reward').textContent = `+${ach.reward} pts — ${ach.desc}`;
    toastEl.classList.add('show');
    sfxLegendary();
    setTimeout(()=>{ toastEl.classList.remove('show'); setTimeout(processToastQueue, 400); }, 3200);
}

export function renderAchievements() {
    const unlocked = getUnlockedAchievements();
    const listEl = document.getElementById('ach-list');
    if (!listEl) return;
    listEl.innerHTML = GameLogic.ACHIEVEMENTS.map(a=>{
        const isUnlocked = unlocked.includes(a.id);
        return `<div class="ach-row ${isUnlocked?'unlocked':''}">
            <div><div class="ach-name">${isUnlocked?'✅':'🔒'} ${a.name}</div><div class="ach-desc">${a.desc}</div></div>
            <div class="ach-reward">+${a.reward}</div>
        </div>`;
    }).join('');
}
