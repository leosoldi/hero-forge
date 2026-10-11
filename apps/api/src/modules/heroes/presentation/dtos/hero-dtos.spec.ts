import { plainToInstance } from 'class-transformer';
import { validateSync } from 'class-validator';
import { validationExceptionFactory } from '../../../../shared/presentation/validation-exception.factory.js';
import { CreateHeroDto } from './create-hero.dto.js';
import { ListHeroesQueryDto } from './list-heroes-query.dto.js';

const validHero = {
  name: 'Robert Bruce Banner',
  nickname: 'Hulk',
  date_of_birth: '1962-04-10',
  universe: 'Marvel',
  main_power: 'Force',
  avatar_url: 'https://example.com/hulk.jpg',
};

function validate<T extends object>(
  dto: new () => T,
  plain: Record<string, unknown>,
) {
  const instance = plainToInstance(dto, plain);
  return { instance, errors: validateSync(instance) };
}

describe('CreateHeroDto', () => {
  it('accepts a valid hero and converts it to domain data', () => {
    const { instance, errors } = validate(CreateHeroDto, validHero);

    expect(errors).toHaveLength(0);
    expect(instance.toHeroData()).toEqual({
      name: 'Robert Bruce Banner',
      nickname: 'Hulk',
      dateOfBirth: new Date(Date.UTC(1962, 3, 10)),
      universe: 'Marvel',
      mainPower: 'Force',
      avatarUrl: 'https://example.com/hulk.jpg',
    });
  });

  it.each([
    ['date_of_birth', '1962-02-31'],
    ['date_of_birth', 1962],
    ['avatar_url', 'ftp://example.com/hulk.jpg'],
    ['nickname', ''],
  ])('rejects an invalid %s (%s)', (field, value) => {
    const { errors } = validate(CreateHeroDto, {
      ...validHero,
      [field]: value,
    });

    expect(errors.map((error) => error.property)).toEqual([field]);
  });

  it('builds a 400 response listing every invalid field', () => {
    const { errors } = validate(CreateHeroDto, {
      ...validHero,
      name: '',
      date_of_birth: 'ontem',
    });

    const response = validationExceptionFactory(errors).getResponse();

    expect(response).toMatchObject({
      status_code: 400,
      code: 'VALIDATION_ERROR',
      details: [
        { field: 'name', messages: expect.any(Array) },
        {
          field: 'date_of_birth',
          messages: [
            'date_of_birth must be a valid date in the format YYYY-MM-DD',
          ],
        },
      ],
    });
  });

  it('prefixes nested fields with the parent name', () => {
    const response = validationExceptionFactory([
      {
        property: 'hero',
        children: [{ property: 'name', constraints: { isNotEmpty: 'empty' } }],
      },
    ]).getResponse();

    expect(response).toMatchObject({
      details: [{ field: 'hero.name', messages: ['empty'] }],
    });
  });
});

describe('ListHeroesQueryDto', () => {
  it('converts pagination values from the query string', () => {
    const { instance, errors } = validate(ListHeroesQueryDto, {
      page: '2',
      limit: '10',
      status: 'inactive',
    });

    expect(errors).toHaveLength(0);
    expect(instance).toMatchObject({ page: 2, limit: 10, status: 'inactive' });
  });

  it('rejects an unknown status and out of range pagination', () => {
    const { errors } = validate(ListHeroesQueryDto, {
      page: '0',
      limit: '500',
      status: 'deleted',
    });

    expect(errors.map((error) => error.property)).toEqual([
      'page',
      'limit',
      'status',
    ]);
  });
});
