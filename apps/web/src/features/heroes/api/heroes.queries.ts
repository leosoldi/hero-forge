import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { Hero, HeroInput, ListHeroesParams } from '../types';
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

export function useHeroQuery(hero: Hero | null) {
  return useQuery({
    queryKey: heroKeys.detail(hero?.id ?? ''),
    queryFn: ({ signal }) => heroesApi.get(hero!.id, signal),
    enabled: Boolean(hero),
    placeholderData: hero ?? undefined,
    staleTime: 0,
  });
}

function useHeroMutation<TVariables>(
  mutationFn: (variables: TVariables) => Promise<Hero>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async (hero) => {
      queryClient.setQueryData(heroKeys.detail(hero.id), hero);
      await queryClient.invalidateQueries({ queryKey: heroKeys.lists() });
    },
  });
}

export const useCreateHero = () =>
  useHeroMutation((input: HeroInput) => heroesApi.create(input));

export const useUpdateHero = () =>
  useHeroMutation(({ id, input }: { id: string; input: HeroInput }) =>
    heroesApi.update(id, input),
  );

export const useDeactivateHero = () =>
  useHeroMutation((id: string) => heroesApi.deactivate(id));

export const useActivateHero = () =>
  useHeroMutation((id: string) => heroesApi.activate(id));
