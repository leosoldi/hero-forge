import { screen } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '../../../../test/msw-server';
import { renderWithProviders } from '../../../../test/render';
import { HeroesPage } from './HeroesPage';

const emptyPage = (total: number) => ({
  data: [],
  meta: { page: 1, limit: 10, total, total_pages: Math.ceil(total / 10) },
});

describe('HeroesPage', () => {
  it('shows how many heroes exist', async () => {
    server.use(http.get('/api/heroes', () => HttpResponse.json(emptyPage(23))));

    renderWithProviders(<HeroesPage />);

    expect(screen.getByText('Carregando o arsenal...')).toBeInTheDocument();
    expect(await screen.findByText('23 heróis no arsenal')).toBeInTheDocument();
  });

  it('uses the singular for a single hero', async () => {
    server.use(http.get('/api/heroes', () => HttpResponse.json(emptyPage(1))));

    renderWithProviders(<HeroesPage />);

    expect(await screen.findByText('1 herói no arsenal')).toBeInTheDocument();
  });

  it('tells the user when the heroes cannot be loaded', async () => {
    server.use(http.get('/api/heroes', () => HttpResponse.error()));

    renderWithProviders(<HeroesPage />);

    expect(
      await screen.findByText('Não foi possível carregar os heróis.'),
    ).toBeInTheDocument();
  });
});
