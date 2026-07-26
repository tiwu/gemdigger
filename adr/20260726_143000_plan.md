# Phase A: v2.1.0 Release Plan (Bugfixes)

This release focuses on resolving issues from v2.0.0 to stabilize the game before new features are added in v3.0.0.

## 1. UI & Styling
- **Unified HUD Buttons**: Move all top-right buttons (`#sound-toggle`, `#help-toggle`, `#lb-toggle`, `#settings-toggle`, `#achievements-toggle`) to a shared `.hud-btn` class in `src/css/base.css` to ensure consistent sizing and alignment.
- **D-Pad Relayout**: Update `index.html` and `src/css/mobile.css` to a more ergonomic 1-3 layout:
  - Row 1: Up button (centered)
  - Row 2: Left, Down, Right buttons

## 2. Audio Improvements
- **Master Mute**: The sound button will now toggle both SFX and Music.
  - Update `src/js/settings.js` and `src/js/main.js` to sync both settings.
  - Ensure unmuting restarts the appropriate biome music.
- **Boot Screen Logic**: Remove the 3.5s auto-dismiss. Require a user gesture (press start) to enter the game, which also ensures the AudioContext is unlocked for the boot jingle and background music.
- **Music Variety**: Enhance `src/js/audio.js` with procedural variations:
  - Multiple lead phrases per biome.
  - Light percussive "ticks" or arpeggio variations.

## 3. Gameplay Fixes
- **Shop Refill**: Change `closeShop()` in `src/js/shop.js` to fully refill fuel and hull. Since the shop is only accessible at the surface base (or outposts), a full refill is logical and fixes the issue where upgrades didn't immediately grant the new capacity.
- **Version Display**: 
  - Add `__APP_VERSION__` to Vite config using `package.json` version.
  - Display version on the Boot Screen and Settings Overlay.

## 4. Maintenance
- **README Sync**: Update README with v2.1.0 details.
- **Testing**: Add/update tests for shop refill and master mute logic.
