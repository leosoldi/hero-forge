import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: { tsconfigPaths: true },
  test: {
    globals: true,
    setupFiles: ['reflect-metadata'],
    root: './',
    include: ['**/*.spec.ts'],
    coverage: {
      include: ['src/**/*.ts'],
      // Bootstrap, módulos, controllers, repositórios TypeORM e classes que só
      // descrevem respostas no Swagger dependem do Nest ou do banco: são
      // cobertos pelos testes de integração (test:e2e)
      exclude: [
        'src/**/*.spec.ts',
        'src/main.ts',
        'src/app.setup.ts',
        'src/**/*.response.ts',
        'src/shared/presentation/error-response.ts',
        'src/**/*.module.ts',
        'src/**/*.controller.ts',
        'src/**/typeorm-*.ts',
        'src/database/*.ts',
        'src/database/migrations/**',
        'src/database/seeds/run-seed.ts',
        'src/docs/**',
      ],
    },
  },
});
