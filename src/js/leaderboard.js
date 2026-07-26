// ── Leaderboard (local + optional remote backend) ───────────────────────────
// Attempts to sync scores with a backend API (see /server) when configured
// via window.GEMDIGGER_API_BASE (set at build/deploy time); always falls
// back to a local top-10 localStorage leaderboard so the game works fully
// offline / without a backend.

export const LB_KEY = 'gemdigger_leaderboard';
export const LB_NAME_KEY = 'gemdigger_playername';

function getApiBase() {
    return (typeof window !== 'undefined' && window.GEMDIGGER_API_BASE) || null;
}

export function getLeaderboard() {
    try { return JSON.parse(localStorage.getItem(LB_KEY)||'[]'); } catch { return []; }
}
export function saveLeaderboardEntry(entry) {
    const lb = getLeaderboard();
    lb.push(entry);
    lb.sort((a,b)=>b.score-a.score);
    localStorage.setItem(LB_KEY, JSON.stringify(lb.slice(0,10)));

    // Best-effort remote sync; never blocks or breaks local play if it fails.
    const apiBase = getApiBase();
    if (apiBase) {
        fetch(`${apiBase}/api/scores`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entry)
        }).catch(()=>{ /* offline/unreachable: local leaderboard already saved */ });
    }
}
export function updateLeaderboardEntryName(id, name) {
    const lb = getLeaderboard();
    const entry = lb.find(e=>e.id === id);
    if (entry) { entry.name = name; localStorage.setItem(LB_KEY, JSON.stringify(lb)); }
}
export function escapeHtml(str) { const d = document.createElement('div'); d.textContent = str; return d.innerHTML; }

// Fetches remote top-10 leaderboard if a backend is configured, otherwise
// resolves with the local leaderboard.
export async function fetchRemoteLeaderboard() {
    const apiBase = getApiBase();
    if (!apiBase) return getLeaderboard();
    try {
        const res = await fetch(`${apiBase}/api/scores/top`);
        if (!res.ok) throw new Error('bad response');
        return await res.json();
    } catch {
        return getLeaderboard();
    }
}

export function renderLeaderboard(lb) {
    const listEl = document.getElementById('leaderboard-list');
    if (!listEl) return;
    if (!lb || lb.length === 0) { listEl.innerHTML = '<div style="text-align:center;color:#7f8c8d;">No runs yet. Get digging!</div>'; return; }
    listEl.innerHTML = lb.map((e,i)=>`<div class="lb-row ${i===0?'top1':''}"><span>#${i+1} ${i===0?'👑':''} ${e.name?escapeHtml(e.name):'Anonymous'}</span><span>${e.score} pts</span><span>${e.depth}m</span><span>${e.gems} gems</span></div>`).join('');
}
