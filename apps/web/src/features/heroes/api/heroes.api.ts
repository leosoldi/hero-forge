import { httpClient } from '../../../shared/api/http-client';
import type {
  Hero,
  HeroInput,
  ListHeroesParams,
  PaginatedHeroes,
} from '../types';

export const heroesApi = {
  list: (params: ListHeroesParams, signal?: AbortSignal) =>
    httpClient.get<PaginatedHeroes>('/heroes', {
      query: { page: params.page, limit: params.limit, search: params.search },
      signal,
    }),

  get: (id: string, signal?: AbortSignal) =>
    httpClient.get<Hero>(`/heroes/${id}`, { signal }),

  create: (input: HeroInput) => httpClient.post<Hero>('/heroes', input),

  update: (id: string, input: HeroInput) =>
    httpClient.put<Hero>(`/heroes/${id}`, input),

  deactivate: (id: string) => httpClient.delete<Hero>(`/heroes/${id}`),

  activate: (id: string) => httpClient.patch<Hero>(`/heroes/${id}/activate`),
};
