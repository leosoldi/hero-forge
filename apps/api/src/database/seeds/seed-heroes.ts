import { extname } from 'node:path';
import { parseDateOnly } from '../../shared/presentation/date-format.js';
import type { FileStorage } from '../../shared/storage/file-storage.js';
import { Hero } from '../../modules/heroes/domain/hero.js';
import type { HeroRepository } from '../../modules/heroes/domain/hero.repository.js';

/** Formato de cada herói no arquivo seed/heroes.json */
export interface HeroSeed {
  name: string;
  nickname: string;
  date_of_birth: string;
  universe: string;
  main_power: string;
  /** Nome do arquivo em seed/avatars */
  avatar: string;
  is_active?: boolean;
}

export interface SeedHeroesDeps {
  repository: HeroRepository;
  storage: FileStorage;
  readAvatar: (fileName: string) => Promise<Buffer>;
}

export interface SeedHeroesOptions {
  /** Popula mesmo que já existam heróis no banco */
  force?: boolean;
  now?: Date;
}

export type SeedResult =
  | { status: 'skipped'; existing: number }
  | { status: 'seeded'; created: number; inactive: number };

const CONTENT_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

// Intervalo entre as datas de criação, para a ordenação "mais recentes primeiro" ficar visível
const CREATED_AT_STEP_MS = 60 * 60 * 1000;

/**
 * Cria os heróis de exemplo pelas mesmas regras de domínio da API. O primeiro
 * herói do arquivo é o mais recente, ou seja, o primeiro da listagem.
 */
export async function seedHeroes(
  seeds: HeroSeed[],
  { repository, storage, readAvatar }: SeedHeroesDeps,
  { force = false, now = new Date() }: SeedHeroesOptions = {},
): Promise<SeedResult> {
  const { total } = await repository.findMany({ page: 1, limit: 1 });

  if (total > 0 && !force) {
    return { status: 'skipped', existing: total };
  }

  let inactive = 0;

  for (const [index, seed] of seeds.entries()) {
    const createdAt = new Date(now.getTime() - index * CREATED_AT_STEP_MS);
    const avatarUrl = await storeAvatar(seed.avatar, storage, readAvatar);

    const hero = Hero.create(
      {
        name: seed.name,
        nickname: seed.nickname,
        dateOfBirth: parseSeedDate(seed),
        universe: seed.universe,
        mainPower: seed.main_power,
        avatarUrl,
      },
      { now: createdAt },
    );

    if (seed.is_active === false) {
      hero.deactivate(createdAt);
      inactive += 1;
    }

    await repository.save(hero);
  }

  return { status: 'seeded', created: seeds.length, inactive };
}

async function storeAvatar(
  fileName: string,
  storage: FileStorage,
  readAvatar: SeedHeroesDeps['readAvatar'],
): Promise<string> {
  const extension = extname(fileName).slice(1).toLowerCase();
  const contentType = CONTENT_TYPES[extension];

  if (!contentType) {
    throw new Error(`Unsupported avatar format in seed: ${fileName}`);
  }

  const content = await readAvatar(fileName);
  const { url } = await storage.save({ content, extension, contentType });

  return url;
}

function parseSeedDate(seed: HeroSeed): Date {
  const date = parseDateOnly(seed.date_of_birth);

  if (!date) {
    throw new Error(
      `Invalid date_of_birth "${seed.date_of_birth}" for ${seed.nickname} (expected YYYY-MM-DD)`,
    );
  }

  return date;
}
