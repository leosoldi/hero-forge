import { Logger, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  AiProvider,
  type EnvironmentVariables,
} from '../../config/env.validation.js';
import { FileStorage } from '../../shared/storage/file-storage.js';
import { UploadsModule } from '../uploads/uploads.module.js';
import {
  AI_PROVIDER_INFO,
  CLOUDFLARE_PROVIDER_INFO,
  DEMO_PROVIDER_INFO,
} from './application/ai-provider-info.js';
import { AvatarGenerator, HeroIdeaGenerator } from './application/ports.js';
import { SuggestHeroUseCase } from './application/suggest-hero.use-case.js';
import { CloudflareAiClient } from './infrastructure/cloudflare/cloudflare-ai.client.js';
import { CloudflareAvatarGenerator } from './infrastructure/cloudflare/cloudflare-avatar.generator.js';
import { CloudflareHeroIdeaGenerator } from './infrastructure/cloudflare/cloudflare-hero-idea.generator.js';
import { DemoAvatarGenerator } from './infrastructure/demo/demo-avatar.generator.js';
import { DemoHeroIdeaGenerator } from './infrastructure/demo/demo-hero-idea.generator.js';
import { HeroSuggestionsController } from './presentation/hero-suggestions.controller.js';

type Config = ConfigService<EnvironmentVariables, true>;

const CLOUDFLARE_CLIENT = Symbol('CLOUDFLARE_CLIENT');

const isCloudflare = (config: Config) =>
  config.get('AI_PROVIDER', { infer: true }) === AiProvider.Cloudflare;

@Module({
  imports: [UploadsModule],
  controllers: [HeroSuggestionsController],
  providers: [
    {
      provide: AI_PROVIDER_INFO,
      inject: [ConfigService],
      useFactory: (config: Config) =>
        isCloudflare(config) ? CLOUDFLARE_PROVIDER_INFO : DEMO_PROVIDER_INFO,
    },
    {
      provide: CLOUDFLARE_CLIENT,
      inject: [ConfigService],
      useFactory: (config: Config) =>
        isCloudflare(config)
          ? new CloudflareAiClient({
              accountId: config.get('CLOUDFLARE_ACCOUNT_ID', { infer: true })!,
              apiToken: config.get('CLOUDFLARE_API_TOKEN', { infer: true })!,
            })
          : null,
    },
    {
      provide: HeroIdeaGenerator,
      inject: [ConfigService, CLOUDFLARE_CLIENT],
      useFactory: (config: Config, client: CloudflareAiClient | null) =>
        client
          ? new CloudflareHeroIdeaGenerator(
              client,
              config.get('CLOUDFLARE_TEXT_MODEL', { infer: true }),
            )
          : new DemoHeroIdeaGenerator(),
    },
    {
      provide: AvatarGenerator,
      inject: [ConfigService, CLOUDFLARE_CLIENT],
      useFactory: (config: Config, client: CloudflareAiClient | null) =>
        client
          ? new CloudflareAvatarGenerator(
              client,
              config.get('CLOUDFLARE_IMAGE_MODEL', { infer: true }),
            )
          : new DemoAvatarGenerator(),
    },
    {
      provide: SuggestHeroUseCase,
      inject: [HeroIdeaGenerator, AvatarGenerator, FileStorage],
      useFactory: (
        ideas: HeroIdeaGenerator,
        avatars: AvatarGenerator,
        storage: FileStorage,
      ) =>
        new SuggestHeroUseCase(
          ideas,
          avatars,
          storage,
          new Logger(SuggestHeroUseCase.name),
        ),
    },
  ],
})
export class HeroSuggestionsModule {}
