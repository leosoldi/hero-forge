import { makeHero } from '@test/support/hero.factory.js';
import { InMemoryHeroRepository } from '@test/support/in-memory-hero.repository.js';
import {
  FileStorage,
  type FileToStore,
  type StoredFile,
} from '../../shared/storage/file-storage.js';
import { type HeroSeed, seedHeroes } from './seed-heroes.js';

class FakeStorage extends FileStorage {
  readonly saved: FileToStore[] = [];

  async save(file: FileToStore): Promise<StoredFile> {
    this.saved.push(file);
    const key = `avatar-${this.saved.length}.${file.extension}`;
    return { key, url: `http://localhost:3333/uploads/${key}` };
  }
}

const seeds: HeroSeed[] = [
  {
    name: 'Ariana Olivia',
    nickname: 'Velox',
    date_of_birth: '1992-07-19',
    universe: 'Terra',
    main_power: 'Super Velocidade',
    avatar: 'velox.webp',
  },
  {
    name: 'Magus',
    nickname: 'Força Bruta',
    date_of_birth: '2002-06-19',
    universe: 'Planeta Magus',
    main_power: 'Super Força',
    avatar: 'forca-bruta.jpg',
    is_active: false,
  },
];

describe('seedHeroes', () => {
  const now = new Date('2026-10-12T12:00:00Z');
  let repository: InMemoryHeroRepository;
  let storage: FakeStorage;
  const readAvatar = vi.fn(async (fileName: string) => Buffer.from(fileName));

  beforeEach(() => {
    repository = new InMemoryHeroRepository();
    storage = new FakeStorage();
    readAvatar.mockClear();
  });

  const run = (force = false) =>
    seedHeroes(seeds, { repository, storage, readAvatar }, { force, now });

  it('creates the heroes keeping the file order as the listing order', async () => {
    const result = await run();

    expect(result).toEqual({ status: 'seeded', created: 2, inactive: 1 });

    const { items } = await repository.findMany({ page: 1, limit: 10 });
    expect(items.map((hero) => hero.nickname)).toEqual([
      'Velox',
      'Força Bruta',
    ]);
    expect(items[0].createdAt).toEqual(now);
    expect(items[1].createdAt.getTime()).toBeLessThan(now.getTime());
  });

  it('stores each avatar and uses the public URL', async () => {
    await run();

    expect(readAvatar).toHaveBeenCalledWith('velox.webp');
    expect(storage.saved.map((file) => file.contentType)).toEqual([
      'image/webp',
      'image/jpeg',
    ]);

    const { items } = await repository.findMany({ page: 1, limit: 10 });
    expect(items[0].avatarUrl).toBe(
      'http://localhost:3333/uploads/avatar-1.webp',
    );
  });

  it('keeps inactive heroes inactive', async () => {
    await run();

    const { items } = await repository.findMany({
      page: 1,
      limit: 10,
      isActive: false,
    });
    expect(items.map((hero) => hero.nickname)).toEqual(['Força Bruta']);
  });

  it('does nothing when the database already has heroes', async () => {
    await repository.save(makeHero());

    const result = await run();

    expect(result).toEqual({ status: 'skipped', existing: 1 });
    expect(repository.size).toBe(1);
    expect(storage.saved).toHaveLength(0);
  });

  it('adds the heroes anyway with force', async () => {
    await repository.save(makeHero());

    const result = await run(true);

    expect(result.status).toBe('seeded');
    expect(repository.size).toBe(3);
  });

  it('rejects an invalid birth date with a clear message', async () => {
    await expect(
      seedHeroes(
        [{ ...seeds[0], date_of_birth: '19/07/1992' }],
        { repository, storage, readAvatar },
        { now },
      ),
    ).rejects.toThrow('Invalid date_of_birth "19/07/1992" for Velox');
  });

  it('rejects an unsupported avatar format', async () => {
    await expect(
      seedHeroes(
        [{ ...seeds[0], avatar: 'velox.gif' }],
        { repository, storage, readAvatar },
        { now },
      ),
    ).rejects.toThrow('Unsupported avatar format in seed: velox.gif');
  });
});
