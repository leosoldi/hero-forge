import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SuggestHeroDto {
  @ApiPropertyOptional({
    description: 'Ideia opcional para guiar a sugestão',
    example: 'heroína do sertão que controla raios',
    maxLength: 200,
  })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  idea?: string;
}

export class HeroSuggestionResponse {
  @ApiProperty({ example: 'Helena Duarte' })
  name: string;

  @ApiProperty({ example: 'Brasa' })
  nickname: string;

  @ApiProperty({ example: '1991-03-12 00:00:00' })
  date_of_birth: string;

  @ApiProperty({ example: 'Ômega' })
  universe: string;

  @ApiProperty({ example: 'Pirocinese' })
  main_power: string;

  @ApiProperty({
    example:
      'Sobreviveu a um incêndio numa siderúrgica e passou a absorver e moldar o calor ao redor.',
  })
  backstory: string;

  @ApiProperty({
    nullable: true,
    type: String,
    example:
      'http://localhost:3333/uploads/2f1c7d2e-9b8a-4c7e-9a51-1d2b3c4d5e6f.jpg',
    description: 'null quando a imagem não pôde ser gerada',
  })
  avatar_url: string | null;
}

export class AiProviderInfoResponse {
  @ApiProperty({ enum: ['demo', 'cloudflare'], example: 'cloudflare' })
  provider: 'demo' | 'cloudflare';

  @ApiProperty({
    nullable: true,
    type: Number,
    example: 100,
    description:
      'Estimativa de sugestões por dia no plano gratuito (null = sem limite)',
  })
  daily_limit: number | null;

  @ApiProperty({
    nullable: true,
    type: String,
    example: '00:00',
    description: 'Horário (UTC) em que a cota diária é renovada',
  })
  resets_at_utc: string | null;
}
