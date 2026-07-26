# Plan: Update Versioning to v0.3.0

## Overview
The application still contains references to version `2.1.0`. We will update the application version to `0.3.0` to clearly represent it as pre-release / test software during iteration. We will keep `package.json` as the single source of truth for the version, which Vite injects dynamically into the screens. We will also update `.clinerules` to enforce this policy.

## Progress Tracking
- [x] Create `plan.md` file
- [x] Update `package.json` and `package-lock.json` version to `0.3.0`
- [x] Add versioning standard directive to `.clinerules`
- [x] Rebuild project and verify built files contain version `0.3.0`
- [x] Run linting (`npm run lint`) to ensure all rules are followed
- [x] Update `README.md` with version notes
- [x] Move `plan.md` to `adr/` directory with timestamp

## Implementation Steps
1. **Create implementation plan**: Write this plan to `plan.md`.
2. **Update package.json**: Modify the version to `"0.3.0"`. Run `npm install` to keep `package-lock.json` in sync.
3. **Update .clinerules**: Add a directive under the Coding guidelines enforcing dynamic versioning from package.json.
4. **Rebuild the project**: Run `npm run build` to compile the app with the new version.
5. **Verify ESLint / Stylelint**: Run `npm run lint` and fix any errors.
6. **Update README.md**: Ensure any reference to `v2.1.0` is removed/updated in `README.md` to indicate the test software is on version `0.3.0`.
7. **Archive plan**: Move `plan.md` to `./adr` timestamped as `YYYYMMDD_HH24mmss_plan.md`.
