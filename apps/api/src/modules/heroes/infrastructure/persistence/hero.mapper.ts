import { Hero } from '../../domain/hero.js';
import { HeroOrmEntity } from './hero.orm-entity.js';

export class HeroMapper {
  static toDomain(entity: HeroOrmEntity): Hero {
    return Hero.restore({
      id: entity.id,
      name: entity.name,
      nickname: entity.nickname,
      dateOfBirth: new Date(`${entity.dateOfBirth}T00:00:00.000Z`),
      universe: entity.universe,
      mainPower: entity.mainPower,
      avatarUrl: entity.avatarUrl,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    });
  }

  static toPersistence(hero: Hero): HeroOrmEntity {
    const entity = new HeroOrmEntity();

    entity.id = hero.id;
    entity.name = hero.name;
    entity.nickname = hero.nickname;
    entity.dateOfBirth = hero.dateOfBirth.toISOString().slice(0, 10);
    entity.universe = hero.universe;
    entity.mainPower = hero.mainPower;
    entity.avatarUrl = hero.avatarUrl;
    entity.isActive = hero.isActive;
    entity.createdAt = hero.createdAt;
    entity.updatedAt = hero.updatedAt;

    return entity;
  }
}
