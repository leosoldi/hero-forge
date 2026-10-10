import { Group, Pagination, Text } from '@mantine/core';
import { resultsRange } from '../lib/results-range';
import type { PaginationMeta } from '../types';

interface HeroesPaginationProps {
  meta: PaginationMeta;
  onChange: (page: number) => void;
}

export function HeroesPagination({ meta, onChange }: HeroesPaginationProps) {
  if (meta.total_pages <= 1) {
    return null;
  }

  return (
    <Group justify="center" pt="md">
      <Pagination
        total={meta.total_pages}
        value={meta.page}
        onChange={onChange}
        radius="md"
        getControlProps={(control) => ({
          'aria-label':
            control === 'previous' ? 'Página anterior' : 'Próxima página',
        })}
        getItemProps={(page) => ({ 'aria-label': `Página ${page}` })}
      />
    </Group>
  );
}

export function ResultsRange({ meta }: { meta: PaginationMeta }) {
  return (
    <Text ff="monospace" size="sm" c="dimmed">
      {resultsRange(meta)}
    </Text>
  );
}
