import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/msw-server';
import { renderWithProviders } from '../../../../test/render';
import { HeroFormModal } from './HeroFormModal';
import { buildHero } from '../../../../test/fixtures/heroes';

const suggestion = {
  name: 'Iara Sertaneja',
  nickname: 'Trovoada',
  date_of_birth: '1994-06-21 00:00:00',
  universe: 'Caatinga',
  main_power: 'Controle de raios',
  backstory: 'Atingida por um raio no sertão, passou a conduzir eletricidade.',
  avatar_url: 'http://localhost:3333/uploads/trovoada.jpg',
};

const field = (name: string) => screen.getByRole('textbox', { name });

describe('Sugerir herói com IA', () => {
  it('fills the form with the suggestion and shows the backstory', async () => {
    let requestBody: unknown;
    server.use(
      http.post('/api/hero-suggestions', async ({ request }) => {
        requestBody = await request.json();
        return HttpResponse.json(suggestion);
      }),
    );
    renderWithProviders(<HeroFormModal opened onClose={vi.fn()} />);

    await userEvent.type(
      screen.getByRole('textbox', { name: 'Ideia para a IA (opcional)' }),
      'heroína do sertão que controla raios',
    );
    await userEvent.click(
      screen.getByRole('button', { name: 'Sugerir herói com IA' }),
    );

    expect(await screen.findByText(suggestion.backstory)).toBeInTheDocument();
    expect(requestBody).toEqual({
      idea: 'heroína do sertão que controla raios',
    });
    expect(field('Nome completo')).toHaveValue('Iara Sertaneja');
    expect(field('Nome de guerra')).toHaveValue('Trovoada');
    expect(screen.getByLabelText(/Data de nascimento/)).toHaveValue(
      '1994-06-21',
    );
    expect(screen.getByRole('combobox', { name: /Universo/ })).toHaveValue(
      'Caatinga',
    );
    expect(field('Habilidade')).toHaveValue('Controle de raios');
    expect(field('Avatar')).toHaveValue(suggestion.avatar_url);
    expect(screen.getByText('Herói sugerido')).toBeInTheDocument();
  });

  it('warns when the suggestion comes without an image', async () => {
    server.use(
      http.post('/api/hero-suggestions', () =>
        HttpResponse.json({ ...suggestion, avatar_url: null }),
      ),
    );
    renderWithProviders(<HeroFormModal opened onClose={vi.fn()} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Sugerir herói com IA' }),
    );

    expect(await screen.findByText('Sugestão sem imagem')).toBeInTheDocument();
    expect(field('Nome de guerra')).toHaveValue('Trovoada');
    expect(field('Avatar')).toHaveValue('');
  });

  it('explains when the AI is unavailable', async () => {
    server.use(
      http.post('/api/hero-suggestions', () =>
        HttpResponse.json(
          { status_code: 503, code: 'AI_UNAVAILABLE', message: 'quota' },
          { status: 503 },
        ),
      ),
    );
    renderWithProviders(<HeroFormModal opened onClose={vi.fn()} />);

    await userEvent.click(
      screen.getByRole('button', { name: 'Sugerir herói com IA' }),
    );

    await waitFor(() =>
      expect(
        screen.getByText(/A IA não conseguiu gerar uma sugestão agora/),
      ).toBeInTheDocument(),
    );
  });

  it('is only offered when creating a hero', () => {
    renderWithProviders(
      <HeroFormModal opened hero={buildHero()} onClose={vi.fn()} />,
    );

    expect(
      screen.queryByRole('button', { name: 'Sugerir herói com IA' }),
    ).not.toBeInTheDocument();
  });
});
