import {
  FileButton,
  Group,
  Input,
  SegmentedControl,
  Stack,
  Text,
  TextInput,
  Button,
} from '@mantine/core';
import { IconLink, IconUpload } from '@tabler/icons-react';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { getErrorMessage } from '../../../shared/api/error-messages';
import {
  ACCEPTED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  uploadsApi,
} from '../../../shared/api/uploads.api';

type AvatarSource = 'url' | 'upload';

interface AvatarFieldProps {
  registration: UseFormRegisterReturn<'avatar_url'>;
  error?: string;
  maxLength: number;
  onUploaded: (url: string) => void;
  onUploadingChange?: (uploading: boolean) => void;
}

export function AvatarField({
  registration,
  error,
  maxLength,
  onUploaded,
  onUploadingChange,
}: AvatarFieldProps) {
  const [source, setSource] = useState<AvatarSource>('url');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const upload = useMutation({
    mutationFn: uploadsApi.uploadImage,
    onMutate: () => onUploadingChange?.(true),
    onSettled: () => onUploadingChange?.(false),
  });

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setUploadError(null);

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setUploadError('O arquivo precisa ser uma imagem JPEG, PNG ou WebP.');
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setUploadError('A imagem deve ter no máximo 2 MB.');
      return;
    }

    try {
      const { url } = await upload.mutateAsync(file);
      setFileName(file.name);
      onUploaded(url);
    } catch (uploadFailure) {
      setUploadError(getErrorMessage(uploadFailure));
    }
  };

  return (
    <Stack gap={6}>
      <Group justify="space-between" align="center">
        <Input.Label required>Avatar</Input.Label>
        <SegmentedControl
          size="xs"
          value={source}
          onChange={(value) => setSource(value as AvatarSource)}
          aria-label="Origem do avatar"
          data={[
            {
              value: 'url',
              label: (
                <Group gap={4} wrap="nowrap">
                  <IconLink size={14} /> Link
                </Group>
              ),
            },
            {
              value: 'upload',
              label: (
                <Group gap={4} wrap="nowrap">
                  <IconUpload size={14} /> Enviar arquivo
                </Group>
              ),
            },
          ]}
        />
      </Group>

      <TextInput
        aria-label="Avatar"
        placeholder="https://..."
        description="URL de uma imagem (http ou https)"
        maxLength={maxLength}
        error={source === 'url' ? error : undefined}
        style={{ display: source === 'url' ? undefined : 'none' }}
        {...registration}
      />

      {source === 'upload' && (
        <Stack gap={4}>
          <FileButton
            onChange={handleFile}
            accept={ACCEPTED_IMAGE_TYPES.join(',')}
          >
            {(props) => (
              <Button
                {...props}
                variant="default"
                leftSection={<IconUpload size={16} />}
                loading={upload.isPending}
              >
                {fileName ? 'Trocar imagem' : 'Escolher imagem'}
              </Button>
            )}
          </FileButton>
          <Text size="xs" c={uploadError || error ? 'red' : 'dimmed'}>
            {uploadError ??
              error ??
              (fileName
                ? `Imagem enviada: ${fileName}`
                : 'JPEG, PNG ou WebP de até 2 MB')}
          </Text>
        </Stack>
      )}
    </Stack>
  );
}
