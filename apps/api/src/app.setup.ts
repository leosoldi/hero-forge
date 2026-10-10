import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'node:path';
import type { EnvironmentVariables } from './config/env.validation.js';
import { GlobalExceptionFilter } from './shared/presentation/filters/global-exception.filter.js';
import { validationExceptionFactory } from './shared/presentation/validation-exception.factory.js';

export function setupApp(app: NestExpressApplication): void {
  const config = app.get(ConfigService<EnvironmentVariables, true>);

  app.enableCors({ origin: config.get('CORS_ORIGIN', { infer: true }) });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      exceptionFactory: validationExceptionFactory,
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());

  app.useStaticAssets(resolve(config.get('UPLOADS_DIR', { infer: true })), {
    prefix: '/uploads',
    immutable: true,
    maxAge: '365d',
    index: false,
    setHeaders: (response) => {
      response.setHeader('X-Content-Type-Options', 'nosniff');
    },
  });

  app.enableShutdownHooks();
}
