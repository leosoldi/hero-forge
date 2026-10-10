import {
  ActionIcon,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  TextInput,
  Tooltip,
} from '@mantine/core';
import { IconInfoCircle, IconSparkles } from '@tabler/icons-react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getErrorMessage } from '../../../shared/api/error-messages';
import { notify } from '../../../shared/ui/notify';
import { heroesApi } from '../api/heroes.api';
import { aiLimitMessage } from '../lib/ai-limit-message';
import { HERO_ERROR_MESSAGES } from '../lib/hero-error-messages';
import type { HeroSuggestion } from '../types';
import classes from './HeroSuggestionPanel.module.css';

interface HeroSuggestionPanelProps {
  onSuggested: (suggestion: HeroSuggestion) => void;
  onLoadingChange?: (loading: boolean) => void;
}

export function HeroSuggestionPanel({
  onSuggested,
  onLoadingChange,
}: HeroSuggestionPanelProps) {
  const [idea, setIdea] = useState('');
  const [backstory, setBackstory] = useState<string | null>(null);

  const { data: providerInfo } = useQuery({
    queryKey: ['hero-suggestions', 'info'],
    queryFn: heroesApi.suggestionInfo,
    staleTime: Infinity,
  });

  const suggest = useMutation({
    mutationFn: heroesApi.suggest,
    onMutate: () => onLoadingChange?.(true),
    onSettled: () => onLoadingChange?.(false),
  });

  const handleSuggest = async () => {
    try {
      const suggestion = await suggest.mutateAsync(idea.trim() || undefined);
      setBackstory(suggestion.backstory);
      onSuggested(suggestion);

      if (suggestion.avatar_url) {
        notify.success(
          'Revise os dados e clique em "Forjar herói" para salvar.',
          'Herói sugerido',
        );
      } else {
        notify.error(
          'Os dados foram sugeridos, mas a imagem não pôde ser gerada. Envie um arquivo ou cole um link.',
          'Sugestão sem imagem',
        );
      }
    } catch (error) {
      notify.error(getErrorMessage(error, HERO_ERROR_MESSAGES));
    }
  };

  return (
    <Paper className={classes.panel}>
      <Stack gap="xs">
        <Stack gap="xs">
          <TextInput
            label="Ideia para a IA (opcional)"
            placeholder="Ex.: heroína do sertão que controla raios"
            value={idea}
            onChange={(event) => setIdea(event.currentTarget.value)}
            maxLength={200}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleSuggest();
              }
            }}
          />
          <Group gap="xs" justify="flex-end" wrap="nowrap">
            <Button
              variant="gradient"
              gradient={{ from: 'ember.6', to: 'grape.6', deg: 120 }}
              leftSection={<IconSparkles size={18} />}
              onClick={handleSuggest}
              loading={suggest.isPending}
            >
              Sugerir herói com IA
            </Button>
            <Tooltip
              label={aiLimitMessage(providerInfo)}
              multiline
              w={300}
              withArrow
              position="top-end"
              events={{ hover: true, focus: true, touch: true }}
            >
              <ActionIcon
                variant="subtle"
                color="gray"
                size={36}
                aria-label="Limite de uso da IA"
              >
                <IconInfoCircle size={20} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Stack>

        {suggest.isPending && (
          <Text size="xs" c="dimmed">
            Forjando o herói: gerando história e avatar, isso pode levar alguns
            segundos...
          </Text>
        )}

        {backstory && !suggest.isPending && (
          <div className={classes.backstory}>
            <Text className={classes.backstoryLabel}>
              História sugerida pela IA
            </Text>
            <Text size="sm">{backstory}</Text>
          </div>
        )}
      </Stack>
    </Paper>
  );
}
