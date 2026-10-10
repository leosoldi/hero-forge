import { ApiProperty } from '@nestjs/swagger';

export class HeroResponse {
  @ApiProperty({ example: 'e314636e-1ca6-4925-a0e7-da5eb5ae2403' })
  id: string;

  @ApiProperty({ example: 'Robert Bruce Banner' })
  name: string;

  @ApiProperty({ example: 'Hulk' })
  nickname: string;

  @ApiProperty({ example: '1962-04-10 00:00:00' })
  date_of_birth: string;

  @ApiProperty({ example: 'Marvel' })
  universe: string;

  @ApiProperty({ example: 'Force' })
  main_power: string;

  @ApiProperty({
    example:
      'https://cdn.pixabay.com/photo/2024/05/07/00/59/hulk-8744607_1280.jpg',
  })
  avatar_url: string;

  @ApiProperty({ example: true })
  is_active: boolean;

  @ApiProperty({ example: '2024-09-18 21:41:43' })
  created_at: string;

  @ApiProperty({ example: '2024-09-18 21:41:43' })
  updated_at: string;
}

export class PaginationMeta {
  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 23 })
  total: number;

  @ApiProperty({ example: 3 })
  total_pages: number;
}

export class PaginatedHeroesResponse {
  @ApiProperty({ type: [HeroResponse] })
  data: HeroResponse[];

  @ApiProperty({ type: PaginationMeta })
  meta: PaginationMeta;
}
