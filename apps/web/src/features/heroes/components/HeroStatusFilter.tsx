import { Group, SegmentedControl, Text } from '@mantine/core';
import type { HeroStatusFilter as Status } from '../types';
import classes from './HeroStatusFilter.module.css';

const OPTIONS: { value: Status; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Ativos' },
  { value: 'inactive', label: 'Inativos' },
];

interface HeroStatusFilterProps {
  value: Status;
  onChange: (value: Status) => void;
}

export function HeroStatusFilter({ value, onChange }: HeroStatusFilterProps) {
  return (
    <SegmentedControl
      aria-label="Filtrar por status"
      value={value}
      onChange={(next) => onChange(next as Status)}
      size="md"
      radius="md"
      color="ember"
      classNames={{ root: classes.root }}
      data={OPTIONS.map((option) => ({
        value: option.value,
        label: (
          <Group gap={8} wrap="nowrap" justify="center">
            {option.value !== 'all' && (
              <span className={classes.dot} data-status={option.value} />
            )}
            <Text span inherit>
              {option.label}
            </Text>
          </Group>
        ),
      }))}
    />
  );
}
