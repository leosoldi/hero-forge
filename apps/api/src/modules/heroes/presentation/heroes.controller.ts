import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ErrorResponse } from '../../../shared/presentation/error-response.js';
import { ActivateHeroUseCase } from '../application/use-cases/activate-hero.use-case.js';
import { CreateHeroUseCase } from '../application/use-cases/create-hero.use-case.js';
import { DeactivateHeroUseCase } from '../application/use-cases/deactivate-hero.use-case.js';
import { GetHeroUseCase } from '../application/use-cases/get-hero.use-case.js';
import { ListHeroesUseCase } from '../application/use-cases/list-heroes.use-case.js';
import { UpdateHeroUseCase } from '../application/use-cases/update-hero.use-case.js';
import { CreateHeroDto } from './dtos/create-hero.dto.js';
import { ListHeroesQueryDto } from './dtos/list-heroes-query.dto.js';
import { UpdateHeroDto } from './dtos/update-hero.dto.js';
import { HeroPresenter } from './hero.presenter.js';
import { HeroResponse, PaginatedHeroesResponse } from './hero.response.js';

const HeroId = () => Param('id', new ParseUUIDPipe({ version: '4' }));

@ApiTags('heroes')
@ApiBadRequestResponse({ type: ErrorResponse, description: 'Dados inválidos' })
@Controller('heroes')
export class HeroesController {
  constructor(
    private readonly createHero: CreateHeroUseCase,
    private readonly listHeroes: ListHeroesUseCase,
    private readonly getHero: GetHeroUseCase,
    private readonly updateHero: UpdateHeroUseCase,
    private readonly deactivateHero: DeactivateHeroUseCase,
    private readonly activateHero: ActivateHeroUseCase,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Lista os heróis, dos mais recentes para os mais antigos',
  })
  @ApiOkResponse({ type: PaginatedHeroesResponse })
  async list(
    @Query() query: ListHeroesQueryDto,
  ): Promise<PaginatedHeroesResponse> {
    const result = await this.listHeroes.execute(query);
    return HeroPresenter.toPaginatedHttp(result);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalha um herói' })
  @ApiOkResponse({ type: HeroResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  async findOne(@HeroId() id: string): Promise<HeroResponse> {
    const hero = await this.getHero.execute(id);
    return HeroPresenter.toHttp(hero);
  }

  @Post()
  @ApiOperation({ summary: 'Cria um herói' })
  @ApiCreatedResponse({ type: HeroResponse })
  @ApiUnprocessableEntityResponse({ type: ErrorResponse })
  async create(@Body() body: CreateHeroDto): Promise<HeroResponse> {
    const hero = await this.createHero.execute(body.toHeroData());
    return HeroPresenter.toHttp(hero);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Edita um herói ativo' })
  @ApiOkResponse({ type: HeroResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  @ApiConflictResponse({
    type: ErrorResponse,
    description: 'Herói inativo não pode ser editado',
  })
  @ApiUnprocessableEntityResponse({ type: ErrorResponse })
  async update(
    @HeroId() id: string,
    @Body() body: UpdateHeroDto,
  ): Promise<HeroResponse> {
    const hero = await this.updateHero.execute(id, body.toHeroData());
    return HeroPresenter.toHttp(hero);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Exclui um herói (exclusão lógica: o herói fica inativo)',
  })
  @ApiOkResponse({ type: HeroResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  @ApiConflictResponse({
    type: ErrorResponse,
    description: 'Herói já está inativo',
  })
  async remove(@HeroId() id: string): Promise<HeroResponse> {
    const hero = await this.deactivateHero.execute(id);
    return HeroPresenter.toHttp(hero);
  }

  @Patch(':id/activate')
  @ApiOperation({ summary: 'Reativa um herói inativo' })
  @ApiOkResponse({ type: HeroResponse })
  @ApiNotFoundResponse({ type: ErrorResponse })
  @ApiConflictResponse({
    type: ErrorResponse,
    description: 'Herói já está ativo',
  })
  async activate(@HeroId() id: string): Promise<HeroResponse> {
    const hero = await this.activateHero.execute(id);
    return HeroPresenter.toHttp(hero);
  }
}
