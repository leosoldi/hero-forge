import { Stack, Text, ThemeIcon, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <Stack align="center" gap="sm" py={80} ta="center">
      <ThemeIcon size={64} radius="xl" variant="light" aria-hidden>
        {icon}
      </ThemeIcon>
      <Title order={2} fz={32} tt="uppercase">
        {title}
      </Title>
      {description && (
        <Text c="dimmed" maw={420}>
          {description}
        </Text>
      )}
      {action}
    </Stack>
  );
}
