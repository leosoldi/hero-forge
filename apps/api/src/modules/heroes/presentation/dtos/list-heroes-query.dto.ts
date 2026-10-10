import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import {
  HERO_PAGINATION,
  HERO_STATUS_FILTERS,
  type HeroStatusFilter,
} from '../../application/use-cases/list-heroes.use-case.js';

export class ListHeroesQueryDto {
  @ApiPropertyOptional({ minimum: 1, default: HERO_PAGINATION.DEFAULT_PAGE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({
    minimum: 1,
    maximum: HERO_PAGINATION.MAX_LIMIT,
    default: HERO_PAGINATION.DEFAULT_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(HERO_PAGINATION.MAX_LIMIT)
  limit?: number;

  @ApiPropertyOptional({
    description: 'Busca por nome completo ou nome de guerra',
    example: 'hulk',
  })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtra pelo status do herói',
    enum: HERO_STATUS_FILTERS,
    default: 'all',
  })
  @IsOptional()
  @IsIn(HERO_STATUS_FILTERS)
  status?: HeroStatusFilter;
}
