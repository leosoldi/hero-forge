import { universeColor } from './universe-color';

describe('universeColor', () => {
  it('always returns the same color for the same universe', () => {
    expect(universeColor('Marvel')).toBe(universeColor('Marvel'));
  });

  it('ignores case and surrounding spaces', () => {
    expect(universeColor('  marvel ')).toBe(universeColor('Marvel'));
  });

  it('returns a complete color set', () => {
    expect(universeColor('DC')).toEqual({
      accent: expect.stringMatching(/^#/),
      tint: expect.stringMatching(/^#/),
      ink: expect.stringMatching(/^#/),
    });
  });
});
