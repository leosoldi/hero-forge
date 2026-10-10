import { zodResolver } from '@hookform/resolvers/zod';
import {
  Autocomplete,
  Box,
  Button,
  Group,
  Modal,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import {
  Controller,
  type UseFormSetError,
  useForm,
  useWatch,
} from 'react-hook-form';
import { useState } from 'react';
import { ApiError } from '../../../shared/api/api-error';
import { getErrorMessage } from '../../../shared/api/error-messages';
import {
  formatDateTime,
  toDateInputValue,
  todayAsDateInputValue,
} from '../../../shared/lib/date';
import { useRetainedValue } from '../../../shared/lib/use-retained-value';
import { notify } from '../../../shared/ui/notify';
import { useCreateHero, useUpdateHero } from '../api/heroes.queries';
import { HERO_ERROR_MESSAGES } from '../lib/hero-error-messages';
import {
  emptyHeroForm,
  HERO_LIMITS,
  heroFormSchema,
  type HeroFormValues,
} from '../lib/hero-form.schema';
import type { Hero } from '../types';
import { AvatarField } from './AvatarField';
import { HeroCard } from './HeroCard';
import classes from './HeroFormModal.module.css';

const UNIVERSE_SUGGESTIONS = [
  'Marvel',
  'DC',
  'Image',
  'Dark Horse',
  'Original',
];

interface HeroFormModalProps {
  opened: boolean;
  hero?: Hero | null;
  onClose: () => void;
}

export function HeroFormModal({
  opened,
  hero: heroProp,
  onClose,
}: HeroFormModalProps) {
  const hero = useRetainedValue(heroProp ?? null, opened);
  const isEdit = Boolean(hero);
  const createHero = useCreateHero();
  const updateHero = useUpdateHero();
  const isSaving = createHero.isPending || updateHero.isPending;

  const handleClose = () => {
    if (!isSaving) onClose();
  };

  const save = async (
    input: HeroFormValues,
    setError: UseFormSetError<HeroFormValues>,
  ) => {
    try {
      if (hero) {
        await updateHero.mutateAsync({ id: hero.id, input });
        notify.success(`${input.nickname} foi atualizado.`, 'Herói atualizado');
      } else {
        await createHero.mutateAsync(input);
        notify.success(
          `${input.nickname} entrou para o arsenal.`,
          'Herói forjado',
        );
      }
      onClose();
    } catch (error) {
      applyFieldErrors(error, setError);
      notify.error(getErrorMessage(error, HERO_ERROR_MESSAGES));
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      size="xl"
      closeOnClickOutside={!isSaving}
      title={
        <Stack gap={2}>
          <Text className={classes.eyebrow}>
            {isEdit ? hero?.nickname : 'Novo registro'}
          </Text>
          <Text className={classes.title}>
            {isEdit ? 'Editar herói' : 'Forjar herói'}
          </Text>
        </Stack>
      }
    >
      <HeroForm
        key={hero?.id ?? 'new'}
        hero={hero ?? null}
        isSaving={isSaving}
        onCancel={handleClose}
        onSubmit={save}
      />
    </Modal>
  );
}

interface HeroFormProps {
  hero: Hero | null;
  isSaving: boolean;
  onCancel: () => void;
  onSubmit: (
    values: HeroFormValues,
    setError: UseFormSetError<HeroFormValues>,
  ) => Promise<void>;
}

function HeroForm({ hero, isSaving, onCancel, onSubmit }: HeroFormProps) {
  const form = useForm<HeroFormValues>({
    resolver: zodResolver(heroFormSchema),
    defaultValues: hero ? toFormValues(hero) : emptyHeroForm,
    mode: 'onTouched',
  });

  const [uploading, setUploading] = useState(false);
  const values = useWatch({ control: form.control });
  const { errors } = form.formState;

  const preview: Hero = {
    id: hero?.id ?? 'preview',
    name: values.name || 'Nome completo',
    nickname: values.nickname || 'Nome de guerra',
    date_of_birth: values.date_of_birth ?? '',
    universe: values.universe || 'Universo',
    main_power: values.main_power || 'Habilidade',
    avatar_url: values.avatar_url ?? '',
    is_active: true,
    created_at: hero?.created_at ?? '',
    updated_at: hero?.updated_at ?? '',
  };

  return (
    <form
      onSubmit={form.handleSubmit((input) => onSubmit(input, form.setError))}
      noValidate
    >
      <div className={classes.layout}>
        <Stack gap="md">
          <TextInput
            label="Nome completo"
            withAsterisk
            maxLength={HERO_LIMITS.name}
            error={errors.name?.message}
            {...form.register('name')}
          />
          <TextInput
            label="Nome de guerra"
            withAsterisk
            maxLength={HERO_LIMITS.nickname}
            error={errors.nickname?.message}
            {...form.register('nickname')}
          />
          <SimpleGrid cols={{ base: 1, xs: 2 }}>
            <TextInput
              label="Data de nascimento"
              type="date"
              withAsterisk
              max={todayAsDateInputValue()}
              error={errors.date_of_birth?.message}
              {...form.register('date_of_birth')}
            />
            <Controller
              control={form.control}
              name="universe"
              render={({ field }) => (
                <Autocomplete
                  label="Universo"
                  withAsterisk
                  data={UNIVERSE_SUGGESTIONS}
                  maxLength={HERO_LIMITS.universe}
                  error={errors.universe?.message}
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  ref={field.ref}
                />
              )}
            />
          </SimpleGrid>
          <TextInput
            label="Habilidade"
            withAsterisk
            maxLength={HERO_LIMITS.main_power}
            error={errors.main_power?.message}
            {...form.register('main_power')}
          />
          <AvatarField
            registration={form.register('avatar_url')}
            error={errors.avatar_url?.message}
            maxLength={HERO_LIMITS.avatar_url}
            onUploadingChange={setUploading}
            onUploaded={(url) =>
              form.setValue('avatar_url', url, {
                shouldValidate: true,
                shouldDirty: true,
              })
            }
          />

          {hero && <ReadOnlyDetails hero={hero} />}
        </Stack>

        <Box visibleFrom="sm" className={classes.preview}>
          <Text className={classes.previewLabel}>
            <span className={classes.liveDot} /> Prévia ao vivo
          </Text>
          <div className={classes.previewCard} aria-hidden>
            <HeroCard hero={preview} />
          </div>
          <Text size="xs" c="dimmed" ta="center">
            É assim que o herói aparecerá na listagem.
          </Text>
        </Box>
      </div>

      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={onCancel} disabled={isSaving}>
          Cancelar
        </Button>
        <Button type="submit" loading={isSaving} disabled={uploading}>
          {hero ? 'Salvar alterações' : 'Forjar herói'}
        </Button>
      </Group>
    </form>
  );
}

function ReadOnlyDetails({ hero }: { hero: Hero }) {
  return (
    <Box className={classes.readOnly}>
      <Text className={classes.readOnlyTitle}>
        Dados do registro (somente leitura)
      </Text>
      <SimpleGrid cols={2} spacing="xs">
        <TextInput
          label="ID"
          value={hero.id}
          readOnly
          variant="filled"
          size="xs"
        />
        <TextInput
          label="Status"
          value={hero.is_active ? 'Ativo' : 'Inativo'}
          readOnly
          variant="filled"
          size="xs"
        />
        <TextInput
          label="Criado em"
          value={formatDateTime(hero.created_at)}
          readOnly
          variant="filled"
          size="xs"
        />
        <TextInput
          label="Atualizado em"
          value={formatDateTime(hero.updated_at)}
          readOnly
          variant="filled"
          size="xs"
        />
      </SimpleGrid>
    </Box>
  );
}

function toFormValues(hero: Hero): HeroFormValues {
  return {
    name: hero.name,
    nickname: hero.nickname,
    date_of_birth: toDateInputValue(hero.date_of_birth),
    universe: hero.universe,
    main_power: hero.main_power,
    avatar_url: hero.avatar_url,
  };
}

function applyFieldErrors(
  error: unknown,
  setError: UseFormSetError<HeroFormValues>,
) {
  if (!(error instanceof ApiError)) return;

  for (const detail of error.details) {
    if (detail.field in emptyHeroForm) {
      setError(detail.field as keyof HeroFormValues, {
        message: detail.messages[0],
      });
    }
  }
}
