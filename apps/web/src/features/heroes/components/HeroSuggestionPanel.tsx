import { Button, Group, Paper, Stack, Text, TextInput } from '@mantine/core';
import { IconSparkles } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { getErrorMessage } from '../../../shared/api/error-messages';
import { notify } from '../../../shared/ui/notify';
import { heroesApi } from '../api/heroes.api';
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
        <Group gap="xs" align="flex-end" wrap="nowrap">
          <TextInput
            label="Ideia para a IA (opcional)"
            placeholder="Ex.: heroína do sertão que controla raios"
            value={idea}
            onChange={(event) => setIdea(event.currentTarget.value)}
            maxLength={200}
            style={{ flex: 1 }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                void handleSuggest();
              }
            }}
          />
          <Button
            variant="gradient"
            gradient={{ from: 'ember.6', to: 'grape.6', deg: 120 }}
            leftSection={<IconSparkles size={18} />}
            onClick={handleSuggest}
            loading={suggest.isPending}
          >
            Sugerir herói com IA
          </Button>
        </Group>

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
