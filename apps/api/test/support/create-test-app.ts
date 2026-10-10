import type { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import type { App } from 'supertest/types.js';
import { DataSource } from 'typeorm';
import { AppModule } from '../../src/app.module.js';
import { setupApp } from '../../src/app.setup.js';

export interface TestApp {
  app: NestExpressApplication<App>;
  dataSource: DataSource;
}

export async function createTestApp(): Promise<TestApp> {
  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestExpressApplication<App>>();
  setupApp(app);
  await app.init();

  return { app, dataSource: app.get(DataSource) };
}
