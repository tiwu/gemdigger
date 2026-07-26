import { defineConfig } from 'vite';
import pkg from './package.json';

// GemDigger is a static single-page game deployed to GitHub Pages, so we
// build with relative asset base paths and emit into dist/.
export default defineConfig({
    base: process.env.VITE_BASE_PATH || './',
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks(id) {
                    if (id.includes('node_modules')) {
                        return 'vendor';
                    }
                }
            }
        }
    },
    test: {
        environment: 'jsdom',
        globals: true,
        include: ['tests/**/*.test.js']
    }
});
