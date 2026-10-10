import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from '../../../shared/presentation/error-response.js';
import { SuggestHeroUseCase } from '../application/suggest-hero.use-case.js';
import {
  AI_PROVIDER_INFO,
  type AiProviderInfo,
} from '../application/ai-provider-info.js';
import {
  AiProviderInfoResponse,
  HeroSuggestionResponse,
  SuggestHeroDto,
} from './suggest-hero.dto.js';

@ApiTags('hero-suggestions')
@Controller('hero-suggestions')
export class HeroSuggestionsController {
  constructor(
    private readonly suggestHero: SuggestHeroUseCase,
    @Inject(AI_PROVIDER_INFO) private readonly providerInfo: AiProviderInfo,
  ) {}

  @Get('info')
  @ApiOperation({
    summary: 'Informa o provedor de IA em uso e o limite diário estimado',
  })
  @ApiOkResponse({ type: AiProviderInfoResponse })
  info(): AiProviderInfoResponse {
    return {
      provider: this.providerInfo.provider,
      daily_limit: this.providerInfo.dailyLimit,
      resets_at_utc: this.providerInfo.resetsAtUtc,
    };
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Sugere um herói com IA generativa (dados + história + avatar). Nada é salvo: o usuário revisa e cria pelo POST /heroes.',
  })
  @ApiOkResponse({ type: HeroSuggestionResponse })
  @ApiServiceUnavailableResponse({ type: ErrorResponse })
  async suggest(@Body() body: SuggestHeroDto): Promise<HeroSuggestionResponse> {
    const suggestion = await this.suggestHero.execute(body.idea);

    return {
      name: suggestion.name,
      nickname: suggestion.nickname,
      date_of_birth: `${suggestion.dateOfBirth} 00:00:00`,
      universe: suggestion.universe,
      main_power: suggestion.mainPower,
      backstory: suggestion.backstory,
      avatar_url: suggestion.avatarUrl,
    };
  }
}
