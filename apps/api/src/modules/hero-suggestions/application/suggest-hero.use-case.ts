import { HERO_CONSTRAINTS } from '../../heroes/domain/hero.constraints.js';
import type { FileStorage } from '../../../shared/storage/file-storage.js';
import { detectImageType } from '../../uploads/domain/image-type.js';
import { AiUnavailableError } from '../domain/ai-unavailable.error.js';
import type { HeroIdea } from '../domain/hero-idea.js';
import type { AvatarGenerator, HeroIdeaGenerator } from './ports.js';

export const BACKSTORY_MAX_LENGTH = 600;

export interface HeroSuggestion {
  name: string;
  nickname: string;
  dateOfBirth: string;
  universe: string;
  mainPower: string;
  backstory: string;
  avatarUrl: string | null;
}

export interface WarningLogger {
  warn(message: string): void;
}

export class SuggestHeroUseCase {
  constructor(
    private readonly ideas: HeroIdeaGenerator,
    private readonly avatars: AvatarGenerator,
    private readonly storage: FileStorage,
    private readonly logger: WarningLogger = { warn: () => {} },
  ) {}

  async execute(idea?: string): Promise<HeroSuggestion> {
    const generated = normalize(
      await this.ideas.generate(idea?.trim() || undefined),
    );

    return {
      name: generated.name,
      nickname: generated.nickname,
      dateOfBirth: generated.dateOfBirth,
      universe: generated.universe,
      mainPower: generated.mainPower,
      backstory: generated.backstory,
      avatarUrl: await this.createAvatar(generated),
    };
  }

  private async createAvatar(idea: HeroIdea): Promise<string | null> {
    try {
      const image = await this.avatars.generate(
        idea.avatarPrompt,
        idea.nickname,
      );
      const type = detectImageType(image.content);

      if (!type) {
        throw new Error('the provider returned an unsupported image format');
      }

      const stored = await this.storage.save({
        content: image.content,
        extension: type.extension,
        contentType: type.contentType,
      });

      return stored.url;
    } catch (error) {
      this.logger.warn(
        `Avatar generation failed, returning the suggestion without image: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      return null;
    }
  }
}

function normalize(idea: HeroIdea): HeroIdea {
  const text = (value: unknown, max: number) =>
    typeof value === 'string' ? value.trim().slice(0, max) : '';

  const normalized: HeroIdea = {
    name: text(idea.name, HERO_CONSTRAINTS.NAME_MAX_LENGTH),
    nickname: text(idea.nickname, HERO_CONSTRAINTS.NICKNAME_MAX_LENGTH),
    universe: text(idea.universe, HERO_CONSTRAINTS.UNIVERSE_MAX_LENGTH),
    mainPower: text(idea.mainPower, HERO_CONSTRAINTS.MAIN_POWER_MAX_LENGTH),
    backstory: text(idea.backstory, BACKSTORY_MAX_LENGTH),
    avatarPrompt: text(idea.avatarPrompt, 1000) || text(idea.nickname, 80),
    dateOfBirth: normalizeDate(idea.dateOfBirth),
  };

  const missing = (
    ['name', 'nickname', 'universe', 'mainPower'] as const
  ).filter((field) => !normalized[field]);

  if (missing.length > 0) {
    throw new AiUnavailableError(
      `incomplete answer (missing ${missing.join(', ')})`,
    );
  }

  return normalized;
}

function normalizeDate(value: unknown): string {
  const fallback = '1990-01-01';
  if (typeof value !== 'string') return fallback;

  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value.trim());
  if (!match) return fallback;

  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  const isReal =
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day;

  return isReal && date.getTime() <= Date.now() ? match[0] : fallback;
}
