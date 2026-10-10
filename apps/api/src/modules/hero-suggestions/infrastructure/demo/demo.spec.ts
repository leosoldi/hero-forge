import { detectImageType } from '../../../uploads/domain/image-type.js';
import { DemoAvatarGenerator } from './demo-avatar.generator.js';
import { DemoHeroIdeaGenerator } from './demo-hero-idea.generator.js';

describe('Demo generators (offline mode)', () => {
  it('creates a complete hero idea without calling external services', async () => {
    const idea = await new DemoHeroIdeaGenerator(() => 0.5).generate();

    expect(idea.name).toMatch(/^\S+ \S+$/);
    expect(idea.dateOfBirth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(idea.nickname).not.toBe('');
    expect(idea.mainPower).not.toBe('');
    expect(idea.backstory).not.toBe('');
  });

  it('mentions the idea so the user knows it is the demo mode', async () => {
    const idea = await new DemoHeroIdeaGenerator(() => 0).generate('raios');

    expect(idea.backstory).toContain('Modo demonstração');
  });

  it('draws a valid PNG avatar, different for each hero', async () => {
    const generator = new DemoAvatarGenerator();

    const first = await generator.generate('', 'Brasa');
    const second = await generator.generate('', 'Maré Alta');

    expect(detectImageType(first.content)?.contentType).toBe('image/png');
    expect(first.content.equals(second.content)).toBe(false);
  });
});
