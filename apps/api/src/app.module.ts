import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validateEnv } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { HealthModule } from './modules/health/health.module.js';
import { HeroSuggestionsModule } from './modules/hero-suggestions/hero-suggestions.module.js';
import { HeroesModule } from './modules/heroes/heroes.module.js';
import { UploadsModule } from './modules/uploads/uploads.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnv,
    }),
    DatabaseModule,
    HealthModule,
    HeroesModule,
    UploadsModule,
    HeroSuggestionsModule,
  ],
})
export class AppModule {}
