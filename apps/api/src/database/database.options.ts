import type { DataSourceOptions } from 'typeorm';
import type { EnvironmentVariables } from '../config/env.validation.js';
import { HeroOrmEntity } from '../modules/heroes/infrastructure/persistence/hero.orm-entity.js';
import { CreateHeroesTable1791600000000 } from './migrations/1791600000000-create-heroes-table.js';

export type DatabaseEnv = Pick<
  EnvironmentVariables,
  | 'DB_HOST'
  | 'DB_PORT'
  | 'DB_USERNAME'
  | 'DB_PASSWORD'
  | 'DB_DATABASE'
  | 'DB_LOGGING'
>;

export function buildDataSourceOptions(env: DatabaseEnv): DataSourceOptions {
  return {
    type: 'mysql',
    host: env.DB_HOST,
    port: env.DB_PORT,
    username: env.DB_USERNAME,
    password: env.DB_PASSWORD,
    database: env.DB_DATABASE,
    logging: env.DB_LOGGING,
    charset: 'utf8mb4_unicode_ci',
    timezone: 'Z',
    entities: [HeroOrmEntity],
    migrations: [CreateHeroesTable1791600000000],
    synchronize: false,
  };
}
