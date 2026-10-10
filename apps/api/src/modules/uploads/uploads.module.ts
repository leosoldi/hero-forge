import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { EnvironmentVariables } from '../../config/env.validation.js';
import { FileStorage } from '../../shared/storage/file-storage.js';
import { UploadImageUseCase } from './application/upload-image.use-case.js';
import { LocalFileStorage } from './infrastructure/local-file-storage.js';
import { UploadsController } from './presentation/uploads.controller.js';

@Module({
  controllers: [UploadsController],
  providers: [
    {
      provide: FileStorage,
      inject: [ConfigService],
      useFactory: (config: ConfigService<EnvironmentVariables, true>) =>
        new LocalFileStorage(
          config.get('UPLOADS_DIR', { infer: true }),
          config.get('PUBLIC_UPLOADS_URL', { infer: true }),
        ),
    },
    {
      provide: UploadImageUseCase,
      inject: [FileStorage],
      useFactory: (storage: FileStorage) => new UploadImageUseCase(storage),
    },
  ],
  exports: [FileStorage],
})
export class UploadsModule {}
