import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ErrorResponse } from '../../../shared/presentation/error-response.js';
import { SuggestHeroUseCase } from '../application/suggest-hero.use-case.js';
import { HeroSuggestionResponse, SuggestHeroDto } from './suggest-hero.dto.js';

@ApiTags('hero-suggestions')
@Controller('hero-suggestions')
export class HeroSuggestionsController {
  constructor(private readonly suggestHero: SuggestHeroUseCase) {}

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
