import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';
import type { EnvironmentVariables } from './config/env.validation.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  const config = app.get(ConfigService<EnvironmentVariables, true>);
  const port = config.get('PORT', { infer: true });

  await app.listen(port);
  Logger.log(`API running on http://localhost:${port}`, 'Bootstrap');
}

await bootstrap();
