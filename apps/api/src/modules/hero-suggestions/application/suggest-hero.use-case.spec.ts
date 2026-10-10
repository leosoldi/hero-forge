import { JPEG_BYTES } from '@test/support/images.js';
import {
  FileStorage,
  type FileToStore,
  type StoredFile,
} from '../../../shared/storage/file-storage.js';
import { AiUnavailableError } from '../domain/ai-unavailable.error.js';
import type { GeneratedImage, HeroIdea } from '../domain/hero-idea.js';
import { AvatarGenerator, HeroIdeaGenerator } from './ports.js';
import { SuggestHeroUseCase } from './suggest-hero.use-case.js';

const idea = (overrides: Partial<HeroIdea> = {}): HeroIdea => ({
  name: 'Iara Sertaneja',
  nickname: 'Trovoada',
  dateOfBirth: '1994-06-21',
  universe: 'Caatinga',
  mainPower: 'Controle de raios',
  backstory: 'Atingida por um raio, passou a conduzir eletricidade.',
  avatarPrompt: 'woman with lightning, desert',
  ...overrides,
});

class FakeIdeas extends HeroIdeaGenerator {
  received: (string | undefined)[] = [];
  constructor(private readonly result: HeroIdea) {
    super();
  }
  async generate(input?: string) {
    this.received.push(input);
    return this.result;
  }
}

class FakeAvatars extends AvatarGenerator {
  constructor(private readonly result: () => Promise<GeneratedImage>) {
    super();
  }
  generate() {
    return this.result();
  }
}

class FakeStorage extends FileStorage {
  saved: FileToStore[] = [];
  async save(file: FileToStore): Promise<StoredFile> {
    this.saved.push(file);
    return {
      key: `a.${file.extension}`,
      url: `http://cdn/a.${file.extension}`,
    };
  }
}

const setup = (
  heroIdea = idea(),
  avatar: () => Promise<GeneratedImage> = async () => ({ content: JPEG_BYTES }),
) => {
  const ideas = new FakeIdeas(heroIdea);
  const storage = new FakeStorage();
  const logger = { warn: vi.fn() };
  const useCase = new SuggestHeroUseCase(
    ideas,
    new FakeAvatars(avatar),
    storage,
    logger,
  );
  return { useCase, ideas, storage, logger };
};

describe('SuggestHeroUseCase', () => {
  it('returns the hero idea with the stored avatar URL', async () => {
    const { useCase, storage } = setup();

    const suggestion = await useCase.execute('heroína que controla raios');

    expect(suggestion).toEqual({
      name: 'Iara Sertaneja',
      nickname: 'Trovoada',
      dateOfBirth: '1994-06-21',
      universe: 'Caatinga',
      mainPower: 'Controle de raios',
      backstory: 'Atingida por um raio, passou a conduzir eletricidade.',
      avatarUrl: 'http://cdn/a.jpg',
    });
    expect(storage.saved[0]).toMatchObject({
      extension: 'jpg',
      contentType: 'image/jpeg',
    });
  });

  it('passes the trimmed idea and ignores blank ideas', async () => {
    const { useCase, ideas } = setup();

    await useCase.execute('  raios  ');
    await useCase.execute('   ');

    expect(ideas.received).toEqual(['raios', undefined]);
  });

  it('fits the AI answer into the hero limits', async () => {
    const { useCase } = setup(
      idea({ nickname: `  ${'x'.repeat(100)}  `, mainPower: 'y'.repeat(200) }),
    );

    const suggestion = await useCase.execute();

    expect(suggestion.nickname).toHaveLength(80);
    expect(suggestion.mainPower).toHaveLength(120);
  });

  it.each(['31/02/1990', '2999-01-01', '1990-02-31', ''])(
    'replaces the invalid date "%s" with a safe default',
    async (dateOfBirth) => {
      const { useCase } = setup(idea({ dateOfBirth }));

      expect((await useCase.execute()).dateOfBirth).toBe('1990-01-01');
    },
  );

  it('fails clearly when the AI answer misses required fields', async () => {
    const { useCase } = setup(idea({ nickname: '', universe: '   ' }));

    await expect(useCase.execute()).rejects.toThrow(AiUnavailableError);
  });

  it('still returns the suggestion when the image cannot be generated', async () => {
    const { useCase, logger } = setup(idea(), async () => {
      throw new Error('quota exceeded');
    });

    const suggestion = await useCase.execute();

    expect(suggestion.avatarUrl).toBeNull();
    expect(suggestion.nickname).toBe('Trovoada');
    expect(logger.warn).toHaveBeenCalledWith(
      expect.stringContaining('quota exceeded'),
    );
  });

  it('does not store files that are not valid images', async () => {
    const { useCase, storage } = setup(idea(), async () => ({
      content: Buffer.from('<html>error page</html>'),
    }));

    expect((await useCase.execute()).avatarUrl).toBeNull();
    expect(storage.saved).toHaveLength(0);
  });
});
