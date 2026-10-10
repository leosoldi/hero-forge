import { JPEG_BYTES } from '@test/support/images.js';
import { AiUnavailableError } from '../../domain/ai-unavailable.error.js';
import { CloudflareAiClient } from './cloudflare-ai.client.js';
import { CloudflareAvatarGenerator } from './cloudflare-avatar.generator.js';
import { CloudflareHeroIdeaGenerator } from './cloudflare-hero-idea.generator.js';

const client = new CloudflareAiClient({
  accountId: 'acc-123',
  apiToken: 'secret-token',
});

const mockFetch = (status: number, body: unknown) =>
  vi
    .spyOn(globalThis, 'fetch')
    .mockResolvedValue(Response.json(body, { status }));

const heroJson = {
  name: 'Iara Sertaneja',
  nickname: 'Trovoada',
  dateOfBirth: '1994-06-21',
  universe: 'Caatinga',
  mainPower: 'Controle de raios',
  backstory: 'Origem...',
  avatarPrompt: 'woman with lightning',
};

afterEach(() => vi.restoreAllMocks());

describe('CloudflareAiClient', () => {
  it('calls the model endpoint with the API token', async () => {
    const fetchSpy = mockFetch(200, { success: true, result: { ok: 1 } });

    await expect(
      client.run('@cf/some/model', { prompt: 'x' }),
    ).resolves.toEqual({ ok: 1 });

    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      'https://api.cloudflare.com/client/v4/accounts/acc-123/ai/run/@cf/some/model',
    );
    expect(init?.headers).toMatchObject({
      Authorization: 'Bearer secret-token',
    });
    expect(JSON.parse(init?.body as string)).toEqual({ prompt: 'x' });
  });

  it('turns provider errors into AiUnavailableError', async () => {
    mockFetch(429, {
      success: false,
      errors: [{ message: 'daily quota exceeded' }],
    });

    await expect(client.run('@cf/m', {})).rejects.toThrow(
      /daily quota exceeded/,
    );
  });

  it('turns network failures into AiUnavailableError', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(
      new TypeError('fetch failed'),
    );

    await expect(client.run('@cf/m', {})).rejects.toThrow(AiUnavailableError);
  });
});

describe('CloudflareHeroIdeaGenerator', () => {
  const generator = new CloudflareHeroIdeaGenerator(client, '@cf/text');

  it('asks for a JSON answer that follows the hero schema, using the idea', async () => {
    const fetchSpy = mockFetch(200, {
      success: true,
      result: { response: heroJson },
    });

    await expect(generator.generate('raios no sertão')).resolves.toEqual(
      heroJson,
    );

    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(body.response_format.type).toBe('json_schema');
    expect(body.response_format.json_schema.required).toContain('nickname');
    expect(body.messages.at(-1).content).toContain('raios no sertão');
  });

  it('also accepts the JSON returned as text', async () => {
    mockFetch(200, {
      success: true,
      result: { response: `Aqui está: ${JSON.stringify(heroJson)} Fim.` },
    });

    await expect(generator.generate()).resolves.toEqual(heroJson);
  });

  it('fails when the model answer is not JSON', async () => {
    mockFetch(200, { success: true, result: { response: 'não sei' } });

    await expect(generator.generate()).rejects.toThrow(AiUnavailableError);
  });
});

describe('CloudflareAvatarGenerator', () => {
  const generator = new CloudflareAvatarGenerator(client, '@cf/image');

  it('decodes the base64 image returned by the model', async () => {
    const fetchSpy = mockFetch(200, {
      success: true,
      result: { image: JPEG_BYTES.toString('base64') },
    });

    const image = await generator.generate('woman with lightning');

    expect(image.content).toEqual(JPEG_BYTES);
    const body = JSON.parse(fetchSpy.mock.calls[0][1]?.body as string);
    expect(body.prompt).toMatch(/^woman with lightning\. .*no text/);
    expect(body.steps).toBe(4);
  });

  it('fails when no image is returned', async () => {
    mockFetch(200, { success: true, result: {} });

    await expect(generator.generate('x')).rejects.toThrow(AiUnavailableError);
  });
});
