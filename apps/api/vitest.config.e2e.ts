import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    setupFiles: ['reflect-metadata'],
    root: './',
    include: ['**/*.e2e-spec.ts'],
    env: {
      NODE_ENV: 'test',
      DB_DATABASE: 'hero_forge_test',
    },
    fileParallelism: false,
    hookTimeout: 30_000,
  },
});
