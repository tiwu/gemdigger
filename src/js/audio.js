// ── Sound (Web Audio API, procedural) ───────────────────────────────────────
import { settings } from './settings.js';
import { state } from './state.js';

let audioCtx = null;
export function getAudioCtx() { if (!audioCtx) audioCtx = new (window.AudioContext||window.webkitAudioContext)(); return audioCtx; }

export function beep(freq, duration, type, gainVal) {
    if (!state.soundEnabled) return;
    try {
        const ctxA = getAudioCtx();
        const osc = ctxA.createOscillator(); const gain = ctxA.createGain();
        osc.type = type || 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime((gainVal || 0.15) * settings.sfxVol, ctxA.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctxA.currentTime + duration);
        osc.connect(gain); gain.connect(ctxA.destination);
        osc.start(); osc.stop(ctxA.currentTime + duration);
    } catch { /* ignore audio error */ }
}
export function sfxDig() { beep(120,0.08,'square',0.06); }
export function sfxGem(rarity) { beep(500 + rarity*150, 0.18, 'sine', 0.12); beep(700 + rarity*150, 0.12, 'sine', 0.08); }
export function sfxFuel() { beep(300,0.15,'triangle',0.1); beep(450,0.12,'triangle',0.08); }
export function sfxLava() { beep(80,0.3,'sawtooth',0.15); }
export function sfxCavein() { beep(60,0.4,'sawtooth',0.12); }
export function sfxLegendary() { [523,659,784,1046].forEach((f,i)=>setTimeout(()=>beep(f,0.3,'sine',0.15), i*120)); }
export function sfxShop() { beep(600,0.08,'square',0.08); }
export function sfxLowWarning(pitch) { beep(pitch||220,0.12,'square',0.09); }
export function sfxHullWarning() { beep(150,0.15,'square',0.1); }

// ── Background Music (procedural loop) ──────────────────────────────────────
let musicStarted = false;
export function isMusicStarted() { return musicStarted; }

export function startMusic() {
    if (musicStarted || !settings.music) return;
    musicStarted = true;
    try {
        getAudioCtx();
        const notes = [130.81, 164.81, 196.00, 164.81]; // simple bass loop (C3,E3,G3,E3)
        let step = 0;
        function playStep() {
            if (!settings.music) { musicStarted = false; return; }
            const ctxA2 = getAudioCtx();
            const osc = ctxA2.createOscillator(); const gain = ctxA2.createGain();
            osc.type = 'sine'; osc.frequency.value = notes[step % notes.length];
            gain.gain.setValueAtTime(0.0001, ctxA2.currentTime);
            gain.gain.linearRampToValueAtTime(0.12*settings.musicVol, ctxA2.currentTime+0.1);
            gain.gain.linearRampToValueAtTime(0.0001, ctxA2.currentTime+0.9);
            osc.connect(gain); gain.connect(ctxA2.destination);
            osc.start(); osc.stop(ctxA2.currentTime+1.0);
            step++;
            setTimeout(playStep, 1000);
        }
        playStep();
    } catch { /* ignore audio error */ }
}

export function tryStartMusicOnGesture() {
    if (settings.music && !musicStarted) startMusic();
    window.removeEventListener('keydown', tryStartMusicOnGesture);
    window.removeEventListener('mousedown', tryStartMusicOnGesture);
    window.removeEventListener('touchstart', tryStartMusicOnGesture);
}

// ── Biome-specific Chiptune Music (retro arcade vibe) ───────────────────────
const BIOME_MUSIC = {
    'Surface':    {
        leads:[
            [523.25,659.25,783.99,659.25, 523.25,659.25,987.77,783.99],
            [523.25,523.25,659.25,659.25, 783.99,783.99,659.25,659.25],
            [783.99,659.25,523.25,392.00, 523.25,659.25,783.99,1046.50]
        ],
        bass:[130.81,130.81,164.81,164.81],
        leadType:'square', bassType:'triangle', stepMs:180
    },
    'Cavern':     {
        leads:[
            [440.00,523.25,440.00,349.23, 440.00,523.25,659.25,523.25],
            [440.00,392.00,349.23,329.63, 440.00,392.00,349.23,261.63]
        ],
        bass:[110.00,110.00,146.83,130.81],
        leadType:'square', bassType:'triangle', stepMs:200
    },
    'Ice Layer':  {
        leads:[
            [698.46,880.00,1046.50,880.00, 698.46,880.00,1318.51,1046.50],
            [1046.50,1046.50,1318.51,1318.51, 880.00,880.00,698.46,698.46]
        ],
        bass:[174.61,174.61,220.00,196.00],
        leadType:'square', bassType:'sine', stepMs:190
    },
    'Magma Layer':{
        leads:[
            [392.00,466.16,392.00,311.13, 392.00,466.16,523.25,466.16],
            [311.13,349.23,392.00,466.16, 523.25,466.16,392.00,349.23]
        ],
        bass:[98.00,98.00,116.54,87.31],
        leadType:'sawtooth', bassType:'square', stepMs:150
    },
    'Deep Core':  {
        leads:[
            [261.63,329.63,392.00,329.63, 246.94,329.63,392.00,293.66],
            [261.63,196.00,130.81,196.00, 261.63,329.63,392.00,523.25]
        ],
        bass:[65.41,65.41,98.00,73.42],
        leadType:'square', bassType:'sine', stepMs:220
    }
};
let currentMusicBiomeName = null;
function playMusicStep(biomeConf, stepRef) {
    if (!settings.music) { musicStarted = false; return; }
    if (stepRef.biomeName !== currentMusicBiomeName) return; // biome changed, stop this loop
    const ctxA2 = getAudioCtx();
    const stepDur = biomeConf.stepMs/1000;

    const leadPhrase = biomeConf.leads[Math.floor(stepRef.step / 16) % biomeConf.leads.length];
    const leadOsc = ctxA2.createOscillator(); const leadGain = ctxA2.createGain();
    leadOsc.type = biomeConf.leadType; leadOsc.frequency.value = leadPhrase[stepRef.step % leadPhrase.length];
    
    // Add subtle detune for "warmth"
    leadOsc.detune.value = (Math.random()-0.5) * 4;

    leadGain.gain.setValueAtTime(0.0001, ctxA2.currentTime);
    leadGain.gain.linearRampToValueAtTime(0.09*settings.musicVol, ctxA2.currentTime+0.02);
    leadGain.gain.linearRampToValueAtTime(0.0001, ctxA2.currentTime + stepDur*0.85);
    leadOsc.connect(leadGain); leadGain.connect(ctxA2.destination);
    leadOsc.start(); leadOsc.stop(ctxA2.currentTime + stepDur);

    // Subtle percussive tick every 4 steps
    if (stepRef.step % 4 === 0) {
        const tickOsc = ctxA2.createOscillator(); const tickGain = ctxA2.createGain();
        tickOsc.type = 'sine'; tickOsc.frequency.value = 10;
        tickGain.gain.setValueAtTime(0.01*settings.musicVol, ctxA2.currentTime);
        tickGain.gain.exponentialRampToValueAtTime(0.0001, ctxA2.currentTime + 0.03);
        tickOsc.connect(tickGain); tickGain.connect(ctxA2.destination);
        tickOsc.start(); tickOsc.stop(ctxA2.currentTime + 0.03);
    }

    if (stepRef.step % 2 === 0) {
        const bassOsc = ctxA2.createOscillator(); const bassGain = ctxA2.createGain();
        bassOsc.type = biomeConf.bassType; bassOsc.frequency.value = biomeConf.bass[(stepRef.step/2|0) % biomeConf.bass.length];
        bassGain.gain.setValueAtTime(0.0001, ctxA2.currentTime);
        bassGain.gain.linearRampToValueAtTime(0.1*settings.musicVol, ctxA2.currentTime+0.02);
        bassGain.gain.linearRampToValueAtTime(0.0001, ctxA2.currentTime + stepDur*2*0.85);
        bassOsc.connect(bassGain); bassGain.connect(ctxA2.destination);
        bassOsc.start(); bassOsc.stop(ctxA2.currentTime + stepDur*2);
    }

    stepRef.step++;
    setTimeout(()=>playMusicStep(biomeConf, stepRef), biomeConf.stepMs);
}
export function startBiomeMusic(biomeName) {
    if (!settings.music) return;
    currentMusicBiomeName = biomeName;
    musicStarted = true;
    try {
        const biomeConf = BIOME_MUSIC[biomeName] || BIOME_MUSIC['Surface'];
        playMusicStep(biomeConf, { step:0, biomeName });
    } catch { /* ignore audio error */ }
}
export function getCurrentMusicBiomeName() { return currentMusicBiomeName; }
export function resetCurrentMusicBiomeName() { currentMusicBiomeName = null; }

// ── Retro Boot Jingle ────────────────────────────────────────────────────────
let bootJinglePlayed = false;
export function playBootJingle() {
    if (bootJinglePlayed || !settings.sfx) return;
    bootJinglePlayed = true;
    try {
        getAudioCtx();
        const seq = [
            { f:261.63, d:0.09, t:'square' }, { f:329.63, d:0.09, t:'square' },
            { f:392.00, d:0.09, t:'square' }, { f:523.25, d:0.09, t:'square' },
            { f:659.25, d:0.09, t:'square' }, { f:783.99, d:0.16, t:'square' },
            { f:659.25, d:0.09, t:'triangle' }, { f:1046.50, d:0.30, t:'square' }
        ];
        let t = 0;
        for (const note of seq) {
            const startAt = t;
            setTimeout(()=>{
                const ctxB = getAudioCtx();
                const osc = ctxB.createOscillator(); const gain = ctxB.createGain();
                osc.type = note.t; osc.frequency.value = note.f;
                gain.gain.setValueAtTime(0.0001, ctxB.currentTime);
                gain.gain.linearRampToValueAtTime(0.18*settings.sfxVol, ctxB.currentTime+0.015);
                gain.gain.exponentialRampToValueAtTime(0.001, ctxB.currentTime+note.d);
                osc.connect(gain); gain.connect(ctxB.destination);
                osc.start(); osc.stop(ctxB.currentTime+note.d+0.02);
            }, startAt*1000);
            t += note.d*0.85;
        }
    } catch { /* ignore audio error */ }
}
