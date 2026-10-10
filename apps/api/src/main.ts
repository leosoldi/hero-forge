import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';
import type { EnvironmentVariables } from './config/env.validation.js';
import { SWAGGER_PATH, setupSwagger } from './docs/swagger.js';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  setupApp(app);
  setupSwagger(app);

  const config = app.get(ConfigService<EnvironmentVariables, true>);
  const port = config.get('PORT', { infer: true });

  await app.listen(port);
  Logger.log(`API running on http://localhost:${port}`, 'Bootstrap');
  Logger.log(
    `Docs available at http://localhost:${port}/${SWAGGER_PATH}`,
    'Bootstrap',
  );
}

await bootstrap();
