import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { PNG_BYTES } from '@test/support/images.js';
import { LocalFileStorage } from './local-file-storage.js';

describe('LocalFileStorage', () => {
  let directory: string;

  beforeEach(async () => {
    directory = await mkdtemp(join(tmpdir(), 'hero-forge-'));
  });

  afterEach(async () => {
    await rm(directory, { recursive: true, force: true });
  });

  it('writes the file with a random name and returns its public URL', async () => {
    const storage = new LocalFileStorage(
      join(directory, 'nested'),
      'http://localhost:3333/uploads/',
    );

    const stored = await storage.save({
      content: PNG_BYTES,
      extension: 'png',
      contentType: 'image/png',
    });

    expect(stored.key).toMatch(/^[0-9a-f-]{36}\.png$/);
    expect(stored.url).toBe(`http://localhost:3333/uploads/${stored.key}`);
    expect(await readFile(join(directory, 'nested', stored.key))).toEqual(
      PNG_BYTES,
    );
  });
});
