import {
  Box,
  Button,
  Container,
  Group,
  Loader,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { useDebouncedValue } from '@mantine/hooks';
import {
  IconAlertTriangle,
  IconPlus,
  IconSearchOff,
  IconShieldPlus,
} from '@tabler/icons-react';
import { useState } from 'react';
import { EmptyState } from '../../../shared/ui/EmptyState';
import { useHeroesQuery } from '../api/heroes.queries';
import { HeroCard } from '../components/HeroCard';
import { HeroCardSkeleton } from '../components/HeroCardSkeleton';
import { HEROES_PER_PAGE, HeroGrid } from '../components/HeroGrid';
import { HeroesPagination, ResultsRange } from '../components/HeroesPagination';
import { HeroSearch } from '../components/HeroSearch';
import classes from './HeroesPage.module.css';

const SEARCH_DEBOUNCE_MS = 350;

export function HeroesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search] = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);
  const [pagination, setPagination] = useState({ page: 1, search: '' });

  const page = pagination.search === search ? pagination.page : 1;
  const setPage = (nextPage: number) =>
    setPagination({ page: nextPage, search });

  const { data, isPending, isError, isFetching, refetch } = useHeroesQuery({
    page,
    limit: HEROES_PER_PAGE,
    search: search || undefined,
  });

  const heroes = data?.data ?? [];

  return (
    <Container size="xl" component="main" py={56}>
      <Stack gap={32}>
        <Group justify="space-between" align="flex-end" gap="lg" wrap="wrap">
          <Stack gap={10}>
            <Text className={classes.eyebrow}>Painel de heróis</Text>
            <Title order={1} className={classes.title}>
              Heróis forjados
            </Title>
            <Text c="dimmed" size="lg">
              Crie, edite e gerencie os heróis do seu universo.
            </Text>
          </Stack>

          <Button size="lg" leftSection={<IconPlus size={20} />} disabled>
            Forjar herói
          </Button>
        </Group>

        <Group justify="space-between" gap="md" wrap="wrap">
          <HeroSearch value={searchInput} onChange={setSearchInput} />
          <Group gap="md">
            {isFetching && !isPending && (
              <Loader size="sm" aria-label="Atualizando a lista" />
            )}
            {data && <ResultsRange meta={data.meta} />}
          </Group>
        </Group>

        {isPending && (
          <HeroGrid>
            {Array.from({ length: HEROES_PER_PAGE }, (_, index) => (
              <HeroCardSkeleton key={index} />
            ))}
          </HeroGrid>
        )}

        {isError && !data && (
          <EmptyState
            icon={<IconAlertTriangle size={32} />}
            title="A forja apagou"
            description="Não foi possível carregar os heróis. Verifique se a API está em execução."
            action={
              <Button variant="light" onClick={() => refetch()}>
                Tentar novamente
              </Button>
            }
          />
        )}

        {data &&
          heroes.length === 0 &&
          (search ? (
            <EmptyState
              icon={<IconSearchOff size={32} />}
              title="Nenhum herói encontrado"
              description={`Nenhum nome ou nome de guerra corresponde a "${search}".`}
              action={
                <Button variant="subtle" onClick={() => setSearchInput('')}>
                  Limpar busca
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<IconShieldPlus size={32} />}
              title="Nenhum herói forjado ainda"
              description="Comece criando o primeiro herói do seu universo."
            />
          ))}

        {heroes.length > 0 && (
          <Box
            className={classes.results}
            data-refreshing={(isFetching && !isPending) || undefined}
          >
            <HeroGrid>
              {heroes.map((hero) => (
                <HeroCard key={hero.id} hero={hero} />
              ))}
            </HeroGrid>
          </Box>
        )}

        {data && <HeroesPagination meta={data.meta} onChange={setPage} />}
      </Stack>
    </Container>
  );
}
