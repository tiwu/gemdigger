# Branch Deployment Plan

This plan outlines the steps to enable branch-based deployments to GitHub Pages. Each branch will be deployed to a subpage under the main GitHub Pages domain (e.g., `https://tiwu.github.io/gemdigger/branch-name/`).

## Key Changes

- `vite.config.js`: Update `base` to support dynamic subdirectories when building for branches.
- `.github/workflows/deploy.yml`: Modify the workflow to build with the correct base path and deploy to a branch-specific subdirectory on the `gh-pages` branch.

## Implementation Steps

1. **Update `vite.config.js`**: Use an environment variable (e.g., `VITE_BASE_PATH`) to set the `base` configuration. Defaults to `./` for local development and main branch.
2. **Modify `.github/workflows/deploy.yml`**:
    - Calculate the target subdirectory based on the branch name.
    - Build the project with the `VITE_BASE_PATH` environment variable.
    - Use a custom deployment step for non-main branches that pushes the `dist` content to a subdirectory on the `gh-pages` branch.
    - Keep `actions/deploy-pages` for the `main` branch as it's the standard way for the primary site.

## Technical Considerations

- GitHub Pages doesn't natively support multiple "environments" in a single repository with different paths easily using the standard `actions/deploy-pages` (which replaces the whole site).
- To achieve subpage deployment, we have two main options:
    1. Use a separate branch (like `gh-pages`) and manually manage directories there.
    2. Use `actions/deploy-pages` but structure the `dist` folder to include the subdirectories.
- Option 2 is cleaner as it keeps using the modern GitHub Pages deployment mechanism. We will build `main` into the root of `dist`, and branches into `dist/branch-name/`. Wait, if we want to *keep* existing branch deployments, we'd need to download previous artifacts or use the `gh-pages` branch as a storage.
- Actually, a common pattern for "preview" or "branch" deployments on GH Pages is to use an action like `JamesIves/github-pages-deploy-action` which can deploy to a specific folder on a branch.

## Success Criteria

- Pushing to `main` updates the main site at the root.
- Pushing to a branch (e.g., `feature-x`) deploys the version to `.../gemdigger/feature-x/`.
- The branch version correctly loads assets from the subdirectory.
