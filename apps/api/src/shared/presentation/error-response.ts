import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorDetail {
  @ApiProperty({ example: 'nickname' })
  field: string;

  @ApiProperty({ example: ['nickname should not be empty'] })
  messages: string[];
}

export class ErrorResponse {
  @ApiProperty({ example: 404 })
  status_code: number;

  @ApiProperty({ example: 'HERO_NOT_FOUND' })
  code: string;

  @ApiProperty({
    example: 'Hero e314636e-1ca6-4925-a0e7-da5eb5ae2403 not found',
  })
  message: string;

  @ApiPropertyOptional({ type: [ErrorDetail] })
  details?: ErrorDetail[];
}
