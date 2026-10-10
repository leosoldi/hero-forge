import { Box } from '@mantine/core';
import { HeroesPage } from '../features/heroes/pages/HeroesPage';
import { AppHeader } from './AppHeader';

export function App() {
  return (
    <Box mih="100vh">
      <AppHeader />
      <HeroesPage />
    </Box>
  );
}
