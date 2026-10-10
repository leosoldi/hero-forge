import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import {
  FileStorage,
  type FileToStore,
  type StoredFile,
} from '../../../shared/storage/file-storage.js';

export class LocalFileStorage extends FileStorage {
  constructor(
    private readonly directory: string,
    private readonly publicBaseUrl: string,
  ) {
    super();
  }

  async save({ content, extension }: FileToStore): Promise<StoredFile> {
    const key = `${randomUUID()}.${extension}`;

    await mkdir(this.directory, { recursive: true });
    await writeFile(join(this.directory, key), content);

    return { key, url: `${this.publicBaseUrl.replace(/\/$/, '')}/${key}` };
  }
}
