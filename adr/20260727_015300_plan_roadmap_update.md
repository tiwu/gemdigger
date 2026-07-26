# Plan: Roadmap Cleanup and v3.1.0 Feature Definition

## 1. Overview
All Phase B features (v3.0.0 "Drill Wear" update) and ideas in `ideas.md` have been successfully implemented. This plan outlines the cleanup of completed items, renaming the `features.md` file to `roadmap.md` for clarity, and defining the next phase of development (**Phase C: v3.1.0 - Progression & Achievements Expansion**).

## 2. Key Changes
- **File Management**: Rename `adr/features.md` to `adr/roadmap.md`.
- **Cleanup**: Remove completed Phase B items from the roadmap and clear `ideas.md`.
- **Roadmap Update**: Promote deferred Progression and Achievement features to Phase C (v3.1.0) and move Multiplayer/Social to Phase D (deferred).
- **Documentation**: Sync `README.md` with new roadmap reference.

## 3. Implementation Steps
1. **Initialize Plan**: Write this plan to `plan.md`. (Done)
2. **Cleanup `adr/ideas.md`**: Clear out implemented items.
3. **Rename & Update Roadmap**:
   - `mv adr/features.md adr/roadmap.md`
   - Update `adr/roadmap.md` to remove Phase B and organize Phase C (v3.1.0) and Phase D.
4. **Update `README.md`**: Update any links or references to the features/roadmap file.
5. **Linting Check**: Run `npm run lint`.
6. **Finalization**: Move `plan.md` to `adr/20260727_015300_plan_roadmap_update.md` (timestamped).

## 4. Technical Considerations
- Ensure that removing Phase B from the roadmap doesn't lose any valuable historical context not already captured in ADRs. (The implementation details are in ADRs, so this should be fine).
- Maintain consistent file naming conventions.

## 5. Success Criteria
- `adr/ideas.md` is empty or reflects only unimplemented ideas.
- `adr/roadmap.md` exists and contains the updated Phase C and Phase D.
- `adr/features.md` no longer exists.
- `README.md` points to the correct roadmap file.
- All linting checks pass.
