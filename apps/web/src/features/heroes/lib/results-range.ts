import type { PaginationMeta } from '../types';

export function resultsRange({ page, limit, total }: PaginationMeta): string {
  if (total === 0) {
    return '0 de 0';
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  return `${start}–${end} de ${total}`;
}
