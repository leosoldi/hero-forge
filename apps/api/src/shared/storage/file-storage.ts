export interface FileToStore {
  content: Buffer;
  extension: string;
  contentType: string;
}

export interface StoredFile {
  key: string;
  url: string;
}

export abstract class FileStorage {
  abstract save(file: FileToStore): Promise<StoredFile>;
}
