import { Box, Container, Group } from '@mantine/core';
import { Logo } from '../shared/ui/Logo';
import classes from './AppHeader.module.css';

export function AppHeader() {
  return (
    <Box component="header" className={classes.header}>
      <Container size="xl" py="md">
        <Group justify="space-between">
          <Logo />
        </Group>
      </Container>
    </Box>
  );
}
