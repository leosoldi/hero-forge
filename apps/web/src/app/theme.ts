import {
  type CSSVariablesResolver,
  type MantineColorsTuple,
  createTheme,
} from '@mantine/core';

const ember: MantineColorsTuple = [
  '#FFF1EA',
  '#FFE0D1',
  '#FFC0A1',
  '#FF9D6E',
  '#FF8A57',
  '#FF7A40',
  '#FF6A2B',
  '#E55A1F',
  '#C24A18',
  '#9C3B12',
];

const dark: MantineColorsTuple = [
  '#F4EEE7',
  '#D9D2CC',
  '#A89D94',
  '#6B6462',
  '#3A3332',
  '#2E2829',
  '#231F20',
  '#1A1718',
  '#141112',
  '#100E0F',
];

export const forgeColors = {
  background: '#100E0F',
  surface: '#1A1718',
  surfaceRaised: '#231F20',
  border: '#2E2829',
  text: '#F4EEE7',
  textMuted: '#A89D94',
  ember: '#FF6A2B',
  gold: '#F5B841',
} as const;

export const theme = createTheme({
  primaryColor: 'ember',
  primaryShade: 6,
  colors: { ember, dark },
  autoContrast: true,
  luminanceThreshold: 0.45,
  fontFamily:
    "'Schibsted Grotesk Variable', system-ui, -apple-system, 'Segoe UI', sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', ui-monospace, monospace",
  headings: {
    fontFamily:
      "'Big Shoulders Display Variable', 'Arial Narrow', system-ui, sans-serif",
    fontWeight: '800',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Button: { defaultProps: { fw: 700 } },
    Modal: {
      defaultProps: {
        radius: 'lg',
        centered: true,
        overlayProps: { backgroundOpacity: 0.7, blur: 4 },
      },
    },
    Menu: { defaultProps: { radius: 'md', shadow: 'xl' } },
    Notification: { defaultProps: { radius: 'md' } },
  },
});

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: {},
  dark: {
    '--mantine-color-body': forgeColors.background,
    '--mantine-color-default': forgeColors.surface,
    '--mantine-color-default-border': forgeColors.border,
  },
});
