export interface ImageType {
  extension: 'jpg' | 'png' | 'webp';
  contentType: 'image/jpeg' | 'image/png' | 'image/webp';
}

const startsWith = (buffer: Buffer, bytes: number[], offset = 0) =>
  bytes.every((byte, index) => buffer[offset + index] === byte);

export function detectImageType(buffer: Buffer): ImageType | null {
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) {
    return { extension: 'jpg', contentType: 'image/jpeg' };
  }

  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return { extension: 'png', contentType: 'image/png' };
  }

  const isRiff = startsWith(buffer, [0x52, 0x49, 0x46, 0x46]);
  const isWebp = startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8);
  if (isRiff && isWebp) {
    return { extension: 'webp', contentType: 'image/webp' };
  }

  return null;
}
