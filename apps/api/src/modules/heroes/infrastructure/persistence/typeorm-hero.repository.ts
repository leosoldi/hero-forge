import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import type { Repository } from 'typeorm';
import type { PaginatedResult } from '../../../../shared/domain/pagination.js';
import type { Hero } from '../../domain/hero.js';
import {
  type FindHeroesParams,
  HeroRepository,
} from '../../domain/hero.repository.js';
import { HeroMapper } from './hero.mapper.js';
import { HeroOrmEntity } from './hero.orm-entity.js';

@Injectable()
export class TypeOrmHeroRepository extends HeroRepository {
  constructor(
    @InjectRepository(HeroOrmEntity)
    private readonly repository: Repository<HeroOrmEntity>,
  ) {
    super();
  }

  async save(hero: Hero): Promise<void> {
    await this.repository.save(HeroMapper.toPersistence(hero));
  }

  async findById(id: string): Promise<Hero | null> {
    const entity = await this.repository.findOneBy({ id });

    return entity ? HeroMapper.toDomain(entity) : null;
  }

  async findMany({
    page,
    limit,
    search,
    isActive,
  }: FindHeroesParams): Promise<PaginatedResult<Hero>> {
    const query = this.repository
      .createQueryBuilder('hero')
      .orderBy('hero.createdAt', 'DESC')
      .addOrderBy('hero.id', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    if (search) {
      query.andWhere('(hero.name LIKE :term OR hero.nickname LIKE :term)', {
        term: `%${escapeLike(search)}%`,
      });
    }

    if (isActive !== undefined) {
      query.andWhere('hero.isActive = :isActive', { isActive });
    }

    const [entities, total] = await query.getManyAndCount();

    return {
      items: entities.map((entity) => HeroMapper.toDomain(entity)),
      total,
      page,
      limit,
    };
  }
}

function escapeLike(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}
