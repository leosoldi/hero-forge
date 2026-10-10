import type {
  FileStorage,
  StoredFile,
} from '../../../shared/storage/file-storage.js';
import { detectImageType } from '../domain/image-type.js';
import { InvalidImageError } from '../domain/invalid-image.error.js';

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;

export class UploadImageUseCase {
  constructor(private readonly storage: FileStorage) {}

  async execute(content: Buffer): Promise<StoredFile> {
    const type = detectImageType(content);

    if (!type) {
      throw new InvalidImageError();
    }

    return this.storage.save({
      content,
      extension: type.extension,
      contentType: type.contentType,
    });
  }
}
