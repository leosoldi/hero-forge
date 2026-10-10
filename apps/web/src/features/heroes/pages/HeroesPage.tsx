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
import { HeroActionsMenu } from '../components/HeroActionsMenu';
import { HeroCard } from '../components/HeroCard';
import { HeroCardSkeleton } from '../components/HeroCardSkeleton';
import { HEROES_PER_PAGE, HeroGrid } from '../components/HeroGrid';
import { HeroesPagination, ResultsRange } from '../components/HeroesPagination';
import { HeroDetailsModal } from '../components/HeroDetailsModal';
import { HeroFormModal } from '../components/HeroFormModal';
import { HeroSearch } from '../components/HeroSearch';
import { HeroStatusFilter } from '../components/HeroStatusFilter';
import {
  ActivateHeroDialog,
  DeactivateHeroDialog,
} from '../components/HeroStatusDialogs';
import { dialogHero, useHeroDialogs } from '../hooks/use-hero-dialogs';
import type { HeroStatusFilter as Status } from '../types';
import classes from './HeroesPage.module.css';

const SEARCH_DEBOUNCE_MS = 350;

const EMPTY_FILTER_MESSAGES: Record<Status, string> = {
  all: 'Nenhum herói',
  active: 'Nenhum herói ativo',
  inactive: 'Nenhum herói inativo',
};

export function HeroesPage() {
  const [searchInput, setSearchInput] = useState('');
  const [search] = useDebouncedValue(searchInput.trim(), SEARCH_DEBOUNCE_MS);
  const [status, setStatus] = useState<Status>('all');

  // Mudar a busca ou o filtro volta para a página 1
  const filtersKey = `${status}|${search}`;
  const [pagination, setPagination] = useState({ page: 1, filtersKey });
  const page = pagination.filtersKey === filtersKey ? pagination.page : 1;
  const setPage = (nextPage: number) =>
    setPagination({ page: nextPage, filtersKey });

  const isFiltered = Boolean(search) || status !== 'all';
  const clearFilters = () => {
    setSearchInput('');
    setStatus('all');
  };

  const { data, isPending, isError, isFetching, refetch } = useHeroesQuery({
    page,
    limit: HEROES_PER_PAGE,
    search: search || undefined,
    status,
  });

  const heroes = data?.data ?? [];
  const dialogs = useHeroDialogs();
  const { dialog } = dialogs;

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

          <Button
            size="lg"
            leftSection={<IconPlus size={20} />}
            onClick={dialogs.openCreate}
          >
            Forjar herói
          </Button>
        </Group>

        <Group justify="space-between" gap="md" wrap="wrap">
          <Group gap="md" wrap="wrap" style={{ flex: '1 1 480px' }}>
            <HeroSearch value={searchInput} onChange={setSearchInput} />
            <HeroStatusFilter value={status} onChange={setStatus} />
          </Group>
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
          (isFiltered ? (
            <EmptyState
              icon={<IconSearchOff size={32} />}
              title="Nenhum herói encontrado"
              description={
                search
                  ? `${EMPTY_FILTER_MESSAGES[status]} com nome ou nome de guerra correspondente a "${search}".`
                  : `${EMPTY_FILTER_MESSAGES[status]} por aqui.`
              }
              action={
                <Button variant="subtle" onClick={clearFilters}>
                  {status === 'all' ? 'Limpar busca' : 'Limpar filtros'}
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={<IconShieldPlus size={32} />}
              title="Nenhum herói forjado ainda"
              description="Comece criando o primeiro herói do seu universo."
              action={
                <Button variant="light" onClick={dialogs.openCreate}>
                  Forjar o primeiro herói
                </Button>
              }
            />
          ))}

        {heroes.length > 0 && (
          <Box
            className={classes.results}
            data-refreshing={(isFetching && !isPending) || undefined}
          >
            <HeroGrid>
              {heroes.map((hero) => (
                <HeroCard
                  key={hero.id}
                  hero={hero}
                  onOpen={dialogs.openDetails}
                  actions={
                    <HeroActionsMenu
                      hero={hero}
                      onEdit={dialogs.openEdit}
                      onDelete={dialogs.openDeactivate}
                      onActivate={dialogs.openActivate}
                    />
                  }
                />
              ))}
            </HeroGrid>
          </Box>
        )}

        {data && <HeroesPagination meta={data.meta} onChange={setPage} />}
      </Stack>

      <HeroFormModal
        opened={dialog?.type === 'create' || dialog?.type === 'edit'}
        hero={dialogHero(dialog, 'edit')}
        onClose={dialogs.close}
      />
      <HeroDetailsModal
        hero={dialogHero(dialog, 'details')}
        onClose={dialogs.close}
        onEdit={dialogs.openEdit}
      />
      <DeactivateHeroDialog
        hero={dialogHero(dialog, 'deactivate')}
        onClose={dialogs.close}
      />
      <ActivateHeroDialog
        hero={dialogHero(dialog, 'activate')}
        onClose={dialogs.close}
      />
    </Container>
  );
}
