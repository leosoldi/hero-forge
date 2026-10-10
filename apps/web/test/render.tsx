import { render, type RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { Providers } from '../src/app/providers';
import { createQueryClient } from '../src/app/query-client';

export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) {
  const queryClient = createQueryClient();
  queryClient.setDefaultOptions({
    queries: { retry: false, staleTime: 0 },
    mutations: { retry: false },
  });

  return render(ui, {
    wrapper: ({ children }) => (
      <Providers queryClient={queryClient} env="test">
        {children}
      </Providers>
    ),
    ...options,
  });
}
