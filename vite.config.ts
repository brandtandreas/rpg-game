import { defineConfig } from 'vite';

export default defineConfig({
  base: '/rpg-game/',
  build: {
    target: 'es2020',
    sourcemap: true,
  },
  server: {
    port: 5173,
    open: false,
  },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
