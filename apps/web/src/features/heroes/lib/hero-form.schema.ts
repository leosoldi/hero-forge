import { z } from 'zod';
import { todayAsDateInputValue } from '../../../shared/lib/date';

export const HERO_LIMITS = {
  name: 120,
  nickname: 80,
  universe: 60,
  main_power: 120,
  avatar_url: 2048,
} as const;

const requiredText = (label: string, max: number) =>
  z
    .string()
    .trim()
    .min(1, `Informe ${label}`)
    .max(max, `Use no máximo ${max} caracteres`);

const isRealDate = (value: string) => {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
};

const isHttpUrl = (value: string) => {
  if (!URL.canParse(value)) return false;
  const { protocol } = new URL(value);
  return protocol === 'http:' || protocol === 'https:';
};

export const heroFormSchema = z.object({
  name: requiredText('o nome completo', HERO_LIMITS.name),
  nickname: requiredText('o nome de guerra', HERO_LIMITS.nickname),
  date_of_birth: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data de nascimento')
    .refine(isRealDate, 'Informe uma data válida')
    .refine(
      (value) => value <= todayAsDateInputValue(),
      'A data não pode estar no futuro',
    ),
  universe: requiredText('o universo', HERO_LIMITS.universe),
  main_power: requiredText('a habilidade', HERO_LIMITS.main_power),
  avatar_url: requiredText('a URL do avatar', HERO_LIMITS.avatar_url).refine(
    isHttpUrl,
    'Informe uma URL válida (http ou https)',
  ),
});

export type HeroFormValues = z.infer<typeof heroFormSchema>;

export const emptyHeroForm: HeroFormValues = {
  name: '',
  nickname: '',
  date_of_birth: '',
  universe: '',
  main_power: '',
  avatar_url: '',
};
