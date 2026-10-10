import { Button, Group, Modal, Text } from '@mantine/core';
import type { ReactNode } from 'react';

interface ConfirmModalProps {
  opened: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  confirmColor?: string;
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmModal({
  opened,
  title,
  message,
  confirmLabel,
  confirmColor = 'ember',
  loading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  return (
    <Modal
      opened={opened}
      onClose={loading ? () => {} : onClose}
      title={<Text fw={700}>{title}</Text>}
      size="sm"
      closeOnClickOutside={!loading}
    >
      <Text c="dimmed">{message}</Text>
      <Group justify="flex-end" mt="xl">
        <Button variant="default" onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button color={confirmColor} onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </Group>
    </Modal>
  );
}
