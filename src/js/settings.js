// ── Settings persistence & UI sync ──────────────────────────────────────────
import { state } from './state.js';

export const SETTINGS_KEY = 'gemdigger_settings';
export let settings = { dpad: true, sfx: true, sfxVol: 0.8, music: true, musicVol: 0.25 };

export function loadSettings() {
    try {
        const saved = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
        if (saved) Object.assign(settings, saved);
    } catch(e) {}
    state.soundEnabled = settings.sfx;
    applySettingsToUI();
    applyDpadVisibility();
}
export function saveSettings() { localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)); }

export function applySettingsToUI() {
    const dpadEl = document.getElementById('setting-dpad');
    const sfxEl = document.getElementById('setting-sfx');
    const sfxVolEl = document.getElementById('setting-sfx-vol');
    const musicEl = document.getElementById('setting-music');
    const musicVolEl = document.getElementById('setting-music-vol');
    const soundToggleEl = document.getElementById('sound-toggle');
    if (dpadEl) dpadEl.checked = settings.dpad;
    if (sfxEl) sfxEl.checked = settings.sfx;
    if (sfxVolEl) sfxVolEl.value = settings.sfxVol;
    if (musicEl) musicEl.checked = settings.music;
    if (musicVolEl) musicVolEl.value = settings.musicVol;
    if (soundToggleEl) soundToggleEl.textContent = (settings.sfx || settings.music) ? '🔊' : '🔇';
}
export function applyDpadVisibility() {
    const dpadEl = document.getElementById('dpad');
    if (dpadEl) dpadEl.style.display = settings.dpad ? 'grid' : 'none';
}
