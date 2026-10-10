import { JPEG_BYTES, PNG_BYTES, WEBP_BYTES } from '@test/support/images.js';
import { detectImageType } from './image-type.js';

describe('detectImageType', () => {
  it.each([
    ['PNG', PNG_BYTES, 'png', 'image/png'],
    ['JPEG', JPEG_BYTES, 'jpg', 'image/jpeg'],
    ['WebP', WEBP_BYTES, 'webp', 'image/webp'],
  ])('recognizes %s by its signature', (_, bytes, extension, contentType) => {
    expect(detectImageType(bytes)).toEqual({ extension, contentType });
  });

  it.each([
    ['text renamed to .png', Buffer.from('not an image at all')],
    [
      'an SVG (may contain scripts)',
      Buffer.from('<svg xmlns="http://www.w3.org/2000/svg"></svg>'),
    ],
    ['an empty file', Buffer.alloc(0)],
  ])('rejects %s', (_, bytes) => {
    expect(detectImageType(bytes)).toBeNull();
  });
});
