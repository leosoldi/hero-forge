import 'reflect-metadata';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { DataSource } from 'typeorm';
import { validateEnv } from '../../config/env.validation.js';
import { HeroOrmEntity } from '../../modules/heroes/infrastructure/persistence/hero.orm-entity.js';
import { TypeOrmHeroRepository } from '../../modules/heroes/infrastructure/persistence/typeorm-hero.repository.js';
import { LocalFileStorage } from '../../modules/uploads/infrastructure/local-file-storage.js';
import { buildDataSourceOptions } from '../database.options.js';
import { type HeroSeed, seedHeroes } from './seed-heroes.js';

// Uso: node dist/database/seeds/run-seed.js [--force]
// Lê os heróis de seed/heroes.json e os avatares de seed/avatars.

const SEED_DIR = resolve('seed');

async function main() {
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  const env = validateEnv(process.env);
  const force = process.argv.includes('--force');

  const dataSource = new DataSource({
    ...buildDataSourceOptions(env),
    migrationsRun: true,
  });
  await dataSource.initialize();

  try {
    const seeds = JSON.parse(
      await readFile(join(SEED_DIR, 'heroes.json'), 'utf8'),
    ) as HeroSeed[];

    const result = await seedHeroes(
      seeds,
      {
        repository: new TypeOrmHeroRepository(
          dataSource.getRepository(HeroOrmEntity),
        ),
        storage: new LocalFileStorage(
          resolve(env.UPLOADS_DIR),
          env.PUBLIC_UPLOADS_URL,
        ),
        readAvatar: (fileName) => readFile(join(SEED_DIR, 'avatars', fileName)),
      },
      { force },
    );

    if (result.status === 'skipped') {
      console.log(
        `O banco já tem ${result.existing} herói(s). Nada foi alterado. Use --force para adicionar os heróis de exemplo mesmo assim.`,
      );
    } else {
      console.log(
        `${result.created} heróis de exemplo criados (${result.inactive} inativos).`,
      );
    }
  } finally {
    await dataSource.destroy();
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
