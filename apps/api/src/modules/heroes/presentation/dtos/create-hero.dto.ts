import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUrl, MaxLength } from 'class-validator';
import { parseDateOnly } from '../../../../shared/presentation/date-format.js';
import { IsDateOnly } from '../../../../shared/presentation/validators/is-date-only.validator.js';
import type { HeroData } from '../../domain/hero.js';
import { HERO_CONSTRAINTS } from '../../domain/hero.constraints.js';

export class CreateHeroDto {
  @ApiProperty({
    description: 'Nome completo',
    example: 'Robert Bruce Banner',
    maxLength: HERO_CONSTRAINTS.NAME_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(HERO_CONSTRAINTS.NAME_MAX_LENGTH)
  name: string;

  @ApiProperty({
    description: 'Nome de guerra',
    example: 'Hulk',
    maxLength: HERO_CONSTRAINTS.NICKNAME_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(HERO_CONSTRAINTS.NICKNAME_MAX_LENGTH)
  nickname: string;

  @ApiProperty({
    description: 'Data de nascimento (YYYY-MM-DD)',
    example: '1962-04-10',
  })
  @IsDateOnly()
  date_of_birth: string;

  @ApiProperty({
    description: 'Universo',
    example: 'Marvel',
    maxLength: HERO_CONSTRAINTS.UNIVERSE_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(HERO_CONSTRAINTS.UNIVERSE_MAX_LENGTH)
  universe: string;

  @ApiProperty({
    description: 'Habilidade principal',
    example: 'Force',
    maxLength: HERO_CONSTRAINTS.MAIN_POWER_MAX_LENGTH,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(HERO_CONSTRAINTS.MAIN_POWER_MAX_LENGTH)
  main_power: string;

  @ApiProperty({
    description: 'URL do avatar (http ou https)',
    example:
      'https://cdn.pixabay.com/photo/2024/05/07/00/59/hulk-8744607_1280.jpg',
    maxLength: HERO_CONSTRAINTS.AVATAR_URL_MAX_LENGTH,
  })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @MaxLength(HERO_CONSTRAINTS.AVATAR_URL_MAX_LENGTH)
  avatar_url: string;

  toHeroData(): HeroData {
    return {
      name: this.name,
      nickname: this.nickname,
      dateOfBirth: parseDateOnly(this.date_of_birth) as Date,
      universe: this.universe,
      mainPower: this.main_power,
      avatarUrl: this.avatar_url,
    };
  }
}
