import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { buildHero } from '../../../../test/fixtures/heroes';
import { server } from '../../../../test/msw-server';
import { renderWithProviders } from '../../../../test/render';
import { HeroFormModal } from './HeroFormModal';

const field = (name: string) => screen.getByRole('textbox', { name });

async function fillValidHero() {
  await userEvent.type(field('Nome completo'), 'Robert Bruce Banner');
  await userEvent.type(field('Nome de guerra'), 'Hulk');
  await userEvent.type(
    screen.getByLabelText(/Data de nascimento/),
    '1962-04-10',
  );
  await userEvent.type(
    screen.getByRole('combobox', { name: /Universo/ }),
    'Marvel',
  );
  await userEvent.type(field('Habilidade'), 'Force');
  await userEvent.type(field('Avatar'), 'https://example.com/hulk.jpg');
}

describe('HeroFormModal', () => {
  it('shows validation messages and does not call the API', async () => {
    const onClose = vi.fn();
    renderWithProviders(<HeroFormModal opened onClose={onClose} />);

    await userEvent.click(screen.getByRole('button', { name: 'Forjar herói' }));

    expect(
      await screen.findByText('Informe o nome completo'),
    ).toBeInTheDocument();
    expect(screen.getByText('Informe o nome de guerra')).toBeInTheDocument();
    expect(screen.getByText('Informe a URL do avatar')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('updates the live preview while typing', async () => {
    renderWithProviders(<HeroFormModal opened onClose={vi.fn()} />);

    await userEvent.type(field('Nome de guerra'), 'Tempestade');

    expect(
      screen.getByRole('heading', { name: 'Tempestade', hidden: true }),
    ).toBeInTheDocument();
  });

  it('creates the hero, shows a success message and closes', async () => {
    let body: unknown;
    server.use(
      http.post('/api/heroes', async ({ request }) => {
        body = await request.json();
        return HttpResponse.json(buildHero({ nickname: 'Hulk' }), {
          status: 201,
        });
      }),
    );
    const onClose = vi.fn();
    renderWithProviders(<HeroFormModal opened onClose={onClose} />);

    await fillValidHero();
    await userEvent.click(screen.getByRole('button', { name: 'Forjar herói' }));

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body).toEqual({
      name: 'Robert Bruce Banner',
      nickname: 'Hulk',
      date_of_birth: '1962-04-10',
      universe: 'Marvel',
      main_power: 'Force',
      avatar_url: 'https://example.com/hulk.jpg',
    });
    expect(await screen.findByText('Herói forjado')).toBeInTheDocument();
  });

  it('shows the API field errors next to the fields', async () => {
    server.use(
      http.post('/api/heroes', () =>
        HttpResponse.json(
          {
            status_code: 400,
            code: 'VALIDATION_ERROR',
            message: 'invalid',
            details: [
              {
                field: 'avatar_url',
                messages: ['avatar_url must be a URL address'],
              },
            ],
          },
          { status: 400 },
        ),
      ),
    );
    const onClose = vi.fn();
    renderWithProviders(<HeroFormModal opened onClose={onClose} />);

    await fillValidHero();
    await userEvent.click(screen.getByRole('button', { name: 'Forjar herói' }));

    expect(
      await screen.findByText('avatar_url must be a URL address'),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Alguns campos estão inválidos/),
    ).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('opens the edit mode with the hero data and the read-only fields', () => {
    const hero = buildHero({ nickname: 'Hulk', is_active: true });
    renderWithProviders(<HeroFormModal opened hero={hero} onClose={vi.fn()} />);

    expect(screen.getByText('Editar herói')).toBeInTheDocument();
    expect(field('Nome de guerra')).toHaveValue('Hulk');
    expect(screen.getByLabelText(/Data de nascimento/)).toHaveValue(
      '1962-04-10',
    );
    expect(field('ID')).toHaveValue(hero.id);
    expect(field('ID')).toHaveAttribute('readonly');
    expect(field('Status')).toHaveValue('Ativo');
  });

  it('sends the update and tells the user', async () => {
    const hero = buildHero({ nickname: 'Hulk' });
    let body: Record<string, unknown> = {};
    server.use(
      http.put(`/api/heroes/${hero.id}`, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ...hero, nickname: 'The Hulk' });
      }),
    );
    const onClose = vi.fn();
    renderWithProviders(<HeroFormModal opened hero={hero} onClose={onClose} />);

    await userEvent.clear(field('Nome de guerra'));
    await userEvent.type(field('Nome de guerra'), 'The Hulk');
    await userEvent.click(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    );

    await waitFor(() => expect(onClose).toHaveBeenCalled());
    expect(body.nickname).toBe('The Hulk');
    expect(body).not.toHaveProperty('is_active');
    expect(await screen.findByText('Herói atualizado')).toBeInTheDocument();
  });

  it('explains when the hero became inactive meanwhile', async () => {
    const hero = buildHero({ nickname: 'Hulk' });
    server.use(
      http.put(`/api/heroes/${hero.id}`, () =>
        HttpResponse.json(
          { status_code: 409, code: 'HERO_INACTIVE', message: 'inactive' },
          { status: 409 },
        ),
      ),
    );
    renderWithProviders(<HeroFormModal opened hero={hero} onClose={vi.fn()} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Salvar alterações' }),
    );

    expect(
      await screen.findByText('Heróis inativos não podem ser editados.'),
    ).toBeInTheDocument();
  });
});
