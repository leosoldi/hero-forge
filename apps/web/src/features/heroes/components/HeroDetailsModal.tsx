import {
  Badge,
  Button,
  Group,
  Loader,
  Modal,
  SimpleGrid,
  Stack,
  Text,
} from '@mantine/core';
import { IconBolt, IconPencil } from '@tabler/icons-react';
import type { ReactNode } from 'react';
import {
  calculateAge,
  formatDate,
  formatDateTime,
} from '../../../shared/lib/date';
import { useRetainedValue } from '../../../shared/lib/use-retained-value';
import { useHeroQuery } from '../api/heroes.queries';
import type { Hero } from '../types';
import { HeroAvatar } from './HeroAvatar';
import classes from './HeroDetailsModal.module.css';

interface HeroDetailsModalProps {
  hero: Hero | null;
  onClose: () => void;
  onEdit: (hero: Hero) => void;
}

export function HeroDetailsModal({
  hero: heroProp,
  onClose,
  onEdit,
}: HeroDetailsModalProps) {
  const opened = Boolean(heroProp);
  const hero = useRetainedValue(heroProp, opened);
  const { data, isFetching } = useHeroQuery(heroProp);
  const current = (opened ? data : null) ?? hero;

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      size="xl"
      title={
        <Group gap="sm">
          <Text className={classes.eyebrow}>Ficha do herói</Text>
          {isFetching && <Loader size="xs" aria-label="Atualizando a ficha" />}
        </Group>
      }
    >
      {current && (
        <div className={classes.layout}>
          <div className={classes.portrait}>
            <HeroAvatar hero={current} className={classes.avatar} />
          </div>

          <Stack gap="lg">
            <Stack gap={6}>
              <Group gap="xs">
                <Badge variant="light" color="gray" radius="sm">
                  {current.universe}
                </Badge>
                <Badge
                  variant="light"
                  color={current.is_active ? 'teal' : 'gray'}
                  radius="sm"
                >
                  {current.is_active ? 'Ativo' : 'Inativo'}
                </Badge>
              </Group>
              <Text className={classes.nickname}>{current.nickname}</Text>
              <Text size="lg" c="dimmed">
                {current.name}
              </Text>
            </Stack>

            <SimpleGrid cols={{ base: 1, xs: 2 }} spacing="md">
              <Field label="Nome completo">{current.name}</Field>
              <Field label="Nome de guerra">{current.nickname}</Field>
              <Field label="Data de nascimento">
                {formatDate(current.date_of_birth)}
                <Text span c="dimmed">
                  {' '}
                  · {calculateAge(current.date_of_birth)} anos
                </Text>
              </Field>
              <Field label="Universo">{current.universe}</Field>
              <Field label="Habilidade">
                <Group gap={6} wrap="nowrap">
                  <IconBolt size={16} color="#F5B841" aria-hidden />
                  {current.main_power}
                </Group>
              </Field>
              <Field label="Status">
                {current.is_active ? 'Ativo' : 'Inativo'}
              </Field>
            </SimpleGrid>

            <Stack gap="md" className={classes.meta}>
              <Field label="ID" mono>
                {current.id}
              </Field>
              <SimpleGrid cols={2} spacing="md">
                <Field label="Criado em">
                  {formatDateTime(current.created_at)}
                </Field>
                <Field label="Atualizado em">
                  {formatDateTime(current.updated_at)}
                </Field>
              </SimpleGrid>
            </Stack>

            <Group justify="flex-end" mt="sm">
              {current.is_active && (
                <Button
                  variant="light"
                  leftSection={<IconPencil size={18} />}
                  onClick={() => onEdit(current)}
                >
                  Editar
                </Button>
              )}
              <Button variant="default" onClick={onClose}>
                Fechar
              </Button>
            </Group>
          </Stack>
        </div>
      )}
    </Modal>
  );
}

function Field({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div>
      <Text className={classes.label}>{label}</Text>
      <Text
        component="div"
        ff={mono ? 'monospace' : undefined}
        size={mono ? 'xs' : 'md'}
        className={classes.value}
      >
        {children}
      </Text>
    </div>
  );
}
