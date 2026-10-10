import { keepPreviousData, useQuery } from '@tanstack/react-query';
import type { ListHeroesParams } from '../types';
import { heroesApi } from './heroes.api';

export const heroKeys = {
  all: ['heroes'] as const,
  lists: () => [...heroKeys.all, 'list'] as const,
  list: (params: ListHeroesParams) => [...heroKeys.lists(), params] as const,
  details: () => [...heroKeys.all, 'detail'] as const,
  detail: (id: string) => [...heroKeys.details(), id] as const,
};

export function useHeroesQuery(params: ListHeroesParams) {
  return useQuery({
    queryKey: heroKeys.list(params),
    queryFn: ({ signal }) => heroesApi.list(params, signal),
    placeholderData: keepPreviousData,
  });
}
