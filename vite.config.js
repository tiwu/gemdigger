import { defineConfig } from 'vite';
import pkg from './package.json';

// GemDigger is a static single-page game deployed to GitHub Pages, so we
// build with relative asset base paths and emit into dist/.
export default defineConfig({
    base: './',
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['tests/**/*.test.js']
    }
});
