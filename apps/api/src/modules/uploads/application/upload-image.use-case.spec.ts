import { PNG_BYTES } from '@test/support/images.js';
import {
  FileStorage,
  type FileToStore,
  type StoredFile,
} from '../../../shared/storage/file-storage.js';
import { InvalidImageError } from '../domain/invalid-image.error.js';
import { UploadImageUseCase } from './upload-image.use-case.js';

class InMemoryFileStorage extends FileStorage {
  readonly files: FileToStore[] = [];

  async save(file: FileToStore): Promise<StoredFile> {
    this.files.push(file);
    return {
      key: `file.${file.extension}`,
      url: `http://cdn/file.${file.extension}`,
    };
  }
}

describe('UploadImageUseCase', () => {
  it('stores valid images using the detected type', async () => {
    const storage = new InMemoryFileStorage();

    const result = await new UploadImageUseCase(storage).execute(PNG_BYTES);

    expect(result.url).toBe('http://cdn/file.png');
    expect(storage.files[0]).toMatchObject({
      extension: 'png',
      contentType: 'image/png',
    });
  });

  it('rejects files that are not images, without storing them', async () => {
    const storage = new InMemoryFileStorage();

    await expect(
      new UploadImageUseCase(storage).execute(Buffer.from('<?php echo 1;')),
    ).rejects.toThrow(InvalidImageError);
    expect(storage.files).toHaveLength(0);
  });
});
