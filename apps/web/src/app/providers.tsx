import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { type QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode, useState } from 'react';
import { createQueryClient } from './query-client';
import { cssVariablesResolver, theme } from './theme';

interface ProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  env?: 'default' | 'test';
}

export function Providers({
  children,
  queryClient,
  env = 'default',
}: ProvidersProps) {
  const [client] = useState(() => queryClient ?? createQueryClient());

  return (
    <QueryClientProvider client={client}>
      <MantineProvider
        theme={theme}
        cssVariablesResolver={cssVariablesResolver}
        defaultColorScheme="dark"
        forceColorScheme="dark"
        env={env}
      >
        <Notifications position="top-right" limit={4} />
        {children}
      </MantineProvider>
    </QueryClientProvider>
  );
}
