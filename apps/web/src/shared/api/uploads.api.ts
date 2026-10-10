import { httpClient } from './http-client';

export const MAX_IMAGE_SIZE_BYTES = 2 * 1024 * 1024;
export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const uploadsApi = {
  uploadImage: (file: File) => {
    const body = new FormData();
    body.append('file', file);
    return httpClient.post<{ url: string }>('/uploads/images', body);
  },
};
