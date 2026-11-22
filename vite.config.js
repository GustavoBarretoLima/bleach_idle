import { defineConfig } from 'vite';

export default defineConfig({ base: './', esbuild: { jsx: 'automatic' }, build: { rollupOptions: { output: { manualChunks: { phaser: ['phaser'] } } } } });
