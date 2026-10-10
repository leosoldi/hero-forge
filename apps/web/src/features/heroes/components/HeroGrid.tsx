import { SimpleGrid } from '@mantine/core';
import type { ReactNode } from 'react';

export const HEROES_PER_PAGE = 10;

export function HeroGrid({ children }: { children: ReactNode }) {
  return (
    <SimpleGrid
      cols={{ base: 2, sm: 3, md: 4, lg: 5 }}
      spacing={{ base: 'sm', sm: 'lg' }}
      verticalSpacing={{ base: 'sm', sm: 'lg' }}
    >
      {children}
    </SimpleGrid>
  );
}
