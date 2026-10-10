import { randomUUID } from 'node:crypto';
import { HERO_CONSTRAINTS } from './hero.constraints.js';
import { HeroAlreadyActiveError } from './errors/hero-already-active.error.js';
import { HeroAlreadyInactiveError } from './errors/hero-already-inactive.error.js';
import { HeroInactiveError } from './errors/hero-inactive.error.js';
import { InvalidHeroError } from './errors/invalid-hero.error.js';

export interface HeroProps {
  id: string;
  name: string;
  nickname: string;
  dateOfBirth: Date;
  universe: string;
  mainPower: string;
  avatarUrl: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type HeroData = Pick<
  HeroProps,
  'name' | 'nickname' | 'dateOfBirth' | 'universe' | 'mainPower' | 'avatarUrl'
>;

export interface CreateHeroOptions {
  id?: string;
  now?: Date;
}

export class Hero {
  private constructor(private props: HeroProps) {}

  static create(data: HeroData, options: CreateHeroOptions = {}): Hero {
    const now = options.now ?? new Date();

    return new Hero({
      id: options.id ?? randomUUID(),
      ...Hero.validate(data, now),
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
  }

  static restore(props: HeroProps): Hero {
    return new Hero({ ...props });
  }

  get id(): string {
    return this.props.id;
  }

  get name(): string {
    return this.props.name;
  }

  get nickname(): string {
    return this.props.nickname;
  }

  get dateOfBirth(): Date {
    return this.props.dateOfBirth;
  }

  get universe(): string {
    return this.props.universe;
  }

  get mainPower(): string {
    return this.props.mainPower;
  }

  get avatarUrl(): string {
    return this.props.avatarUrl;
  }

  get isActive(): boolean {
    return this.props.isActive;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  get updatedAt(): Date {
    return this.props.updatedAt;
  }

  update(changes: Partial<HeroData>, now = new Date()): void {
    if (!this.props.isActive) {
      throw new HeroInactiveError(this.props.id);
    }

    const definedChanges = Object.fromEntries(
      Object.entries(changes).filter(([, value]) => value !== undefined),
    ) as Partial<HeroData>;

    const data = Hero.validate({ ...this.data(), ...definedChanges }, now);

    this.props = { ...this.props, ...data, updatedAt: now };
  }

  deactivate(now = new Date()): void {
    if (!this.props.isActive) {
      throw new HeroAlreadyInactiveError(this.props.id);
    }

    this.props = { ...this.props, isActive: false, updatedAt: now };
  }

  activate(now = new Date()): void {
    if (this.props.isActive) {
      throw new HeroAlreadyActiveError(this.props.id);
    }

    this.props = { ...this.props, isActive: true, updatedAt: now };
  }

  private data(): HeroData {
    const { name, nickname, dateOfBirth, universe, mainPower, avatarUrl } =
      this.props;

    return { name, nickname, dateOfBirth, universe, mainPower, avatarUrl };
  }

  private static validate(data: HeroData, now: Date): HeroData {
    const errors: string[] = [];

    const text = (field: string, value: string, maxLength: number) => {
      const trimmed = (value ?? '').trim();

      if (!trimmed) {
        errors.push(`${field} is required`);
      } else if (trimmed.length > maxLength) {
        errors.push(`${field} must have at most ${maxLength} characters`);
      }

      return trimmed;
    };

    const name = text('name', data.name, HERO_CONSTRAINTS.NAME_MAX_LENGTH);
    const nickname = text(
      'nickname',
      data.nickname,
      HERO_CONSTRAINTS.NICKNAME_MAX_LENGTH,
    );
    const universe = text(
      'universe',
      data.universe,
      HERO_CONSTRAINTS.UNIVERSE_MAX_LENGTH,
    );
    const mainPower = text(
      'mainPower',
      data.mainPower,
      HERO_CONSTRAINTS.MAIN_POWER_MAX_LENGTH,
    );
    const avatarUrl = text(
      'avatarUrl',
      data.avatarUrl,
      HERO_CONSTRAINTS.AVATAR_URL_MAX_LENGTH,
    );

    if (avatarUrl && !isHttpUrl(avatarUrl)) {
      errors.push('avatarUrl must be a valid http(s) URL');
    }

    const dateOfBirth = toUtcDate(data.dateOfBirth);

    if (!dateOfBirth) {
      errors.push('dateOfBirth must be a valid date');
    } else if (dateOfBirth.getTime() > now.getTime()) {
      errors.push('dateOfBirth cannot be in the future');
    }

    if (errors.length > 0 || !dateOfBirth) {
      throw new InvalidHeroError(errors);
    }

    return { name, nickname, dateOfBirth, universe, mainPower, avatarUrl };
  }
}

function toUtcDate(value: Date): Date | null {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) {
    return null;
  }

  return new Date(
    Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()),
  );
}

function isHttpUrl(value: string): boolean {
  if (!URL.canParse(value)) {
    return false;
  }

  const { protocol } = new URL(value);
  return protocol === 'http:' || protocol === 'https:';
}
