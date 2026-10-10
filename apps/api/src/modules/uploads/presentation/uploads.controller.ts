import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiProperty,
  ApiTags,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ErrorResponse } from '../../../shared/presentation/error-response.js';
import {
  MAX_IMAGE_SIZE_BYTES,
  UploadImageUseCase,
} from '../application/upload-image.use-case.js';

class UploadResponse {
  @ApiProperty({
    example:
      'http://localhost:3333/uploads/2f1c7d2e-9b8a-4c7e-9a51-1d2b3c4d5e6f.png',
  })
  url: string;
}

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadImage: UploadImageUseCase) {}

  @Post('images')
  @ApiOperation({
    summary: 'Envia uma imagem (JPEG, PNG ou WebP, até 2 MB) e retorna a URL',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['file'],
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  @ApiCreatedResponse({ type: UploadResponse })
  @ApiUnprocessableEntityResponse({ type: ErrorResponse })
  @ApiPayloadTooLargeResponse({ type: ErrorResponse })
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMAGE_SIZE_BYTES, files: 1 },
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<UploadResponse> {
    if (!file) {
      throw new BadRequestException({
        status_code: 400,
        code: 'FILE_REQUIRED',
        message: 'Send the image in the "file" field',
      });
    }

    const stored = await this.uploadImage.execute(file.buffer);
    return { url: stored.url };
  }
}
