import { heroFormSchema, type HeroFormValues } from './hero-form.schema';

const valid: HeroFormValues = {
  name: 'Robert Bruce Banner',
  nickname: 'Hulk',
  date_of_birth: '1962-04-10',
  universe: 'Marvel',
  main_power: 'Force',
  avatar_url: 'https://example.com/hulk.jpg',
};

const errorsFor = (values: Partial<HeroFormValues>) => {
  const result = heroFormSchema.safeParse({ ...valid, ...values });
  return result.success
    ? {}
    : Object.fromEntries(
        result.error.issues.map((issue) => [issue.path[0], issue.message]),
      );
};

describe('heroFormSchema', () => {
  it('accepts valid data and trims text', () => {
    const result = heroFormSchema.parse({ ...valid, nickname: '  Hulk  ' });
    expect(result.nickname).toBe('Hulk');
  });

  it('requires every field', () => {
    expect(errorsFor({ name: '   ', nickname: '' })).toEqual({
      name: 'Informe o nome completo',
      nickname: 'Informe o nome de guerra',
    });
  });

  it('rejects dates that do not exist or are in the future', () => {
    expect(errorsFor({ date_of_birth: '2026-02-31' })).toEqual({
      date_of_birth: 'Informe uma data válida',
    });
    expect(errorsFor({ date_of_birth: '2999-01-01' })).toEqual({
      date_of_birth: 'A data não pode estar no futuro',
    });
  });

  it('only accepts http(s) avatar URLs', () => {
    expect(errorsFor({ avatar_url: 'ftp://example.com/a.png' })).toEqual({
      avatar_url: 'Informe uma URL válida (http ou https)',
    });
  });

  it('enforces the same length limits as the API', () => {
    expect(errorsFor({ nickname: 'x'.repeat(81) })).toEqual({
      nickname: 'Use no máximo 80 caracteres',
    });
  });
});
