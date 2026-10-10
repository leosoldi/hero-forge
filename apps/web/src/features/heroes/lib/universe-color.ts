const PALETTE = [
  { accent: '#FF6A2B', tint: '#2B140B', ink: '#FFB089' },
  { accent: '#4FB3FF', tint: '#0C1F2B', ink: '#9ED3FF' },
  { accent: '#B58CFF', tint: '#1F1530', ink: '#D4BDFF' },
  { accent: '#5BD08A', tint: '#0E2418', ink: '#A8E9C1' },
  { accent: '#F5B841', tint: '#2A1F0B', ink: '#FAD98E' },
  { accent: '#FF6B8B', tint: '#2B0F17', ink: '#FFB3C3' },
] as const;

export type UniverseColor = (typeof PALETTE)[number];

export function universeColor(universe: string): UniverseColor {
  const key = universe.trim().toLowerCase();
  let hash = 0;

  for (const char of key) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }

  return PALETTE[hash % PALETTE.length];
}
