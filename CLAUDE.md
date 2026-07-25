# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow
- **Build**: No build step required for this simple browser game.
- **Lint**: `npm run lint`
- **Test**: `npm test`
- **Run Single Test**: `npm test <filename>`

## Architecture Overview
This is a standalone web application built with Vanilla JS and HTML5 Canvas. 
- `index.html`: Contains the UI, CSS styles, and Game Engine logic.
- **Game Engine**: Managed via a requestAnimationFrame loop.
- **World Representation**: A 2D Grid array of Tile objects.
- **Mining Logic**: Tiles have "hardness" values; clicking/moving triggers tile destruction based on drill power.
- **Procedural Generation**: The cave is generated using a Random Walk algorithm to ensure connectivity.

## Key Patterns
- **State Management**: Global game state object (score, inventory, map).
- **Entity Component System**: Separate objects for the Player (drill) and Gems.