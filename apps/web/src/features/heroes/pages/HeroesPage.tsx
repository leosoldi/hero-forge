import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconPlus } from '@tabler/icons-react';
import { useHeroesQuery } from '../api/heroes.queries';
import classes from './HeroesPage.module.css';

export function HeroesPage() {
  const { data, isLoading, isError } = useHeroesQuery({ page: 1, limit: 10 });

  return (
    <Container size="xl" component="main" py={56}>
      <Group justify="space-between" align="flex-end" gap="lg" wrap="wrap">
        <Stack gap={10}>
          <Text className={classes.eyebrow}>Painel de heróis</Text>
          <Title order={1} className={classes.title}>
            Heróis forjados
          </Title>
          <Text c="dimmed" size="lg">
            {isLoading && 'Carregando o arsenal...'}
            {isError && 'Não foi possível carregar os heróis.'}
            {data &&
              `${data.meta.total} ${data.meta.total === 1 ? 'herói' : 'heróis'} no arsenal`}
          </Text>
        </Stack>

        <Button size="lg" leftSection={<IconPlus size={20} />} disabled>
          Forjar herói
        </Button>
      </Group>
    </Container>
  );
}
