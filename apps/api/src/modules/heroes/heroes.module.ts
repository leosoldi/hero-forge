import { Module, type Provider } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActivateHeroUseCase } from './application/use-cases/activate-hero.use-case.js';
import { CreateHeroUseCase } from './application/use-cases/create-hero.use-case.js';
import { DeactivateHeroUseCase } from './application/use-cases/deactivate-hero.use-case.js';
import { GetHeroUseCase } from './application/use-cases/get-hero.use-case.js';
import { ListHeroesUseCase } from './application/use-cases/list-heroes.use-case.js';
import { UpdateHeroUseCase } from './application/use-cases/update-hero.use-case.js';
import { HeroRepository } from './domain/hero.repository.js';
import { HeroOrmEntity } from './infrastructure/persistence/hero.orm-entity.js';
import { TypeOrmHeroRepository } from './infrastructure/persistence/typeorm-hero.repository.js';

type UseCaseClass = new (heroRepository: HeroRepository) => unknown;

const useCases: UseCaseClass[] = [
  CreateHeroUseCase,
  ListHeroesUseCase,
  GetHeroUseCase,
  UpdateHeroUseCase,
  DeactivateHeroUseCase,
  ActivateHeroUseCase,
];

const useCaseProviders: Provider[] = useCases.map((UseCase) => ({
  provide: UseCase,
  useFactory: (heroRepository: HeroRepository) => new UseCase(heroRepository),
  inject: [HeroRepository],
}));

@Module({
  imports: [TypeOrmModule.forFeature([HeroOrmEntity])],
  providers: [
    { provide: HeroRepository, useClass: TypeOrmHeroRepository },
    ...useCaseProviders,
  ],
})
export class HeroesModule {}
