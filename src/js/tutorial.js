/**
 * contextual tutorial hints to guide new players
 */

const HINTS_KEY = 'gemdigger_seen_hints';

const HINTS = {
    start: "Use WASD or Arrows to dig down. ⛏️",
    gem_found: "You found a gem! Return to the Surface Base (🏠) to sell it and buy upgrades.",
    low_fuel: "Fuel is running low! Return to the Surface Base (🏠) at the top to refuel.",
    at_base: "Welcome back! Here your fuel and hull are restored. Open the Shop to spend points.",
    shop: "Buy Upgrades to dig deeper. Move Speed and Drill Power are essential! 🚀",
    hard_rock: "This rock is too hard! Drilling it damages your hull. Upgrade Drill Power! ⚙️",
    hazard: "Watch out! Hazards like Lava damage your hull. 🌋"
};

let seenHints = [];
try {
    seenHints = JSON.parse(localStorage.getItem(HINTS_KEY) || '[]');
} catch (_e) {
    seenHints = [];
}

let hintEl = null;
let hintTextEl = null;
let hintTimeout = null;

function getHintElements() {
    if (!hintEl) hintEl = document.getElementById('tutorial-hint');
    if (!hintTextEl) hintTextEl = document.getElementById('tutorial-hint-text');
    return { hintEl, hintTextEl };
}

export function triggerHint(id) {
    if (seenHints.includes(id)) return;
    if (!HINTS[id]) return;

    const { hintEl, hintTextEl } = getHintElements();
    if (!hintEl || !hintTextEl) {
        // Silently fail if DOM is not available (e.g. in tests)
        seenHints.push(id);
        localStorage.setItem(HINTS_KEY, JSON.stringify(seenHints));
        return;
    }

    // Show the hint
    hintTextEl.textContent = HINTS[id];
    hintEl.style.display = 'block';
    hintEl.style.opacity = '1';

    // Mark as seen
    seenHints.push(id);
    localStorage.setItem(HINTS_KEY, JSON.stringify(seenHints));

    // Auto-hide after 6 seconds
    if (hintTimeout) clearTimeout(hintTimeout);
    hintTimeout = setTimeout(hideHint, 6000);
}

export function hideHint() {
    const { hintEl } = getHintElements();
    if (!hintEl) return;
    hintEl.style.opacity = '0';
    setTimeout(() => {
        hintEl.style.display = 'none';
    }, 300);
}

export function resetTutorial() {
    seenHints = [];
    localStorage.removeItem(HINTS_KEY);
}
