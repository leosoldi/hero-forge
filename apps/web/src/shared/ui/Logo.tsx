import { Group, Text, ThemeIcon } from '@mantine/core';
import { IconHammer } from '@tabler/icons-react';

export function Logo() {
  return (
    <Group gap="sm" wrap="nowrap">
      <ThemeIcon size={40} radius="md" color="ember" aria-hidden>
        <IconHammer size={24} stroke={2} />
      </ThemeIcon>
      <Text component="span" ff="heading" fw={900} fz={26} lts="0.06em" lh={1}>
        HERO
        <Text component="span" inherit c="ember.6">
          FORGE
        </Text>
      </Text>
    </Group>
  );
}
