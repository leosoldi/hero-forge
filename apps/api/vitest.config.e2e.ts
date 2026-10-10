import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    setupFiles: ['reflect-metadata', './test/support/load-env.ts'],
    root: './',
    include: ['**/*.e2e-spec.ts'],
    env: {
      NODE_ENV: 'test',
      DB_DATABASE: 'hero_forge_test',
      TZ: 'America/Sao_Paulo',
      UPLOADS_DIR: 'storage/test-uploads',
    },
    fileParallelism: false,
    hookTimeout: 30_000,
  },
});
