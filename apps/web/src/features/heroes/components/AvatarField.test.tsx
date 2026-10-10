import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/msw-server';
import { renderWithProviders } from '../../../../test/render';
import { HeroFormModal } from './HeroFormModal';

const fileInput = () =>
  document.querySelector<HTMLInputElement>('input[type="file"]')!;

const image = (name = 'avatar.png', size = 1024, type = 'image/png') =>
  new File([new Uint8Array(size)], name, { type });

async function switchToUpload() {
  renderWithProviders(<HeroFormModal opened onClose={vi.fn()} />);
  await userEvent.click(screen.getByText('Enviar arquivo'));
}

describe('Avatar upload', () => {
  it('uploads the image and fills the avatar URL', async () => {
    server.use(
      http.post('/api/uploads/images', () =>
        HttpResponse.json(
          { url: 'http://localhost:3333/uploads/abc.png' },
          { status: 201 },
        ),
      ),
    );
    await switchToUpload();

    await userEvent.upload(fileInput(), image());

    expect(
      await screen.findByText('Imagem enviada: avatar.png'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('textbox', { name: 'Avatar', hidden: true }),
    ).toHaveValue('http://localhost:3333/uploads/abc.png');
  });

  it('rejects images larger than 2 MB before sending them', async () => {
    const upload = vi.fn();
    server.use(
      http.post('/api/uploads/images', () => {
        upload();
        return HttpResponse.json({ url: 'x' });
      }),
    );
    await switchToUpload();

    await userEvent.upload(fileInput(), image('huge.png', 2 * 1024 * 1024 + 1));

    expect(
      await screen.findByText('A imagem deve ter no máximo 2 MB.'),
    ).toBeInTheDocument();
    expect(upload).not.toHaveBeenCalled();
  });

  it('rejects files that are not images', async () => {
    const user = userEvent.setup({ applyAccept: false });
    await switchToUpload();

    await user.upload(fileInput(), image('notes.txt', 10, 'text/plain'));

    expect(
      await screen.findByText(
        'O arquivo precisa ser uma imagem JPEG, PNG ou WebP.',
      ),
    ).toBeInTheDocument();
  });

  it('shows the API error when the server refuses the file', async () => {
    server.use(
      http.post('/api/uploads/images', () =>
        HttpResponse.json(
          { status_code: 422, code: 'INVALID_IMAGE', message: 'invalid' },
          { status: 422 },
        ),
      ),
    );
    await switchToUpload();

    await userEvent.upload(fileInput(), image());

    await waitFor(() =>
      expect(
        screen.getByText('O arquivo precisa ser uma imagem JPEG, PNG ou WebP.'),
      ).toBeInTheDocument(),
    );
  });
});
