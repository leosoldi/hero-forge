import { notifications } from '@mantine/notifications';

export const notify = {
  success: (message: string, title = 'Tudo certo') =>
    notifications.show({ title, message, color: 'teal', autoClose: 4000 }),
  error: (message: string, title = 'Algo deu errado') =>
    notifications.show({ title, message, color: 'red', autoClose: 6000 }),
};
