import { CloseButton, TextInput } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';

interface HeroSearchProps {
  value: string;
  onChange: (value: string) => void;
}

export function HeroSearch({ value, onChange }: HeroSearchProps) {
  return (
    <TextInput
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder="Buscar por nome ou nome de guerra"
      aria-label="Buscar heróis"
      size="md"
      radius="md"
      maxLength={100}
      leftSection={<IconSearch size={18} />}
      rightSection={
        value ? (
          <CloseButton aria-label="Limpar campo de busca" onClick={() => onChange('')} />
        ) : null
      }
      style={{ flex: '1 1 320px', maxWidth: 640 }}
    />
  );
}
