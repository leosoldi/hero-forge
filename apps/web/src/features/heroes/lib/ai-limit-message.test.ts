import { aiLimitMessage } from './ai-limit-message';

describe('aiLimitMessage', () => {
  it('explains the Cloudflare daily quota in Brasília time', () => {
    const message = aiLimitMessage({
      provider: 'cloudflare',
      daily_limit: 100,
      resets_at_utc: '00:00',
    });

    expect(message).toContain('cerca de 100 sugestões por dia');
    expect(message).toContain('às 21h (horário de Brasília)');
  });

  it('tells there is no limit in the demo mode', () => {
    expect(
      aiLimitMessage({
        provider: 'demo',
        daily_limit: null,
        resets_at_utc: null,
      }),
    ).toContain('sem limite diário');
  });

  it('has a generic message while the info is not available', () => {
    expect(aiLimitMessage(undefined)).toContain('limite diário');
  });
});
