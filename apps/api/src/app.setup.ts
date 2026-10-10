import { type INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from './config/env.validation.js';

export function setupApp(app: INestApplication): void {
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }) });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableShutdownHooks();
}
