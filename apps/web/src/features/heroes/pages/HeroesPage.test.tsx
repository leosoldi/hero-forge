import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { buildHero, buildPage } from '../../../../test/fixtures/heroes';
import { server } from '../../../../test/msw-server';
import { renderWithProviders } from '../../../../test/render';
import { HeroesPage } from './HeroesPage';

function mockHeroesApi(
  respond: (params: URLSearchParams) => ReturnType<typeof HttpResponse.json>,
) {
  const calls: URLSearchParams[] = [];
  server.use(
    http.get('/api/heroes', ({ request }) => {
      const params = new URL(request.url).searchParams;
      calls.push(params);
      return respond(params);
    }),
  );
  return calls;
}

describe('HeroesPage', () => {
  it('lists the heroes returned by the API', async () => {
    mockHeroesApi(() =>
      HttpResponse.json(
        buildPage([
          buildHero({ nickname: 'Hulk' }),
          buildHero({ nickname: 'Batman' }),
        ]),
      ),
    );

    renderWithProviders(<HeroesPage />);

    expect(
      await screen.findByRole('heading', { name: 'Hulk' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Batman' })).toBeInTheDocument();
    expect(screen.getByText('1–2 de 2')).toBeInTheDocument();
  });

  it('requests 10 heroes per page', async () => {
    const calls = mockHeroesApi(() => HttpResponse.json(buildPage([])));

    renderWithProviders(<HeroesPage />);

    await waitFor(() => expect(calls).toHaveLength(1));
    expect(calls[0].get('page')).toBe('1');
    expect(calls[0].get('limit')).toBe('10');
  });

  it('navigates between pages', async () => {
    const calls = mockHeroesApi((params) => {
      const page = Number(params.get('page'));
      return HttpResponse.json(
        buildPage([buildHero({ nickname: `Página ${page}` })], {
          page,
          total: 15,
        }),
      );
    });

    renderWithProviders(<HeroesPage />);
    await screen.findByRole('heading', { name: 'Página 1' });

    await userEvent.click(screen.getByRole('button', { name: 'Página 2' }));

    expect(
      await screen.findByRole('heading', { name: 'Página 2' }),
    ).toBeInTheDocument();
    expect(calls.at(-1)?.get('page')).toBe('2');
  });

  it('searches by name or nickname and goes back to the first page', async () => {
    const calls = mockHeroesApi((params) => {
      const search = params.get('search');
      const page = Number(params.get('page'));
      const heroes = search
        ? [buildHero({ nickname: 'Batman' })]
        : [buildHero({ nickname: 'Hulk' })];
      return HttpResponse.json(buildPage(heroes, { page, total: 15 }));
    });

    renderWithProviders(<HeroesPage />);
    await screen.findByRole('heading', { name: 'Hulk' });
    await userEvent.click(screen.getByRole('button', { name: 'Página 2' }));
    await waitFor(() => expect(calls.at(-1)?.get('page')).toBe('2'));

    await userEvent.type(screen.getByLabelText('Buscar heróis'), '  bat ');

    expect(
      await screen.findByRole('heading', { name: 'Batman' }),
    ).toBeInTheDocument();
    expect(calls.at(-1)?.get('search')).toBe('bat');
    expect(calls.at(-1)?.get('page')).toBe('1');
  });

  it('explains when the search finds nothing and allows clearing it', async () => {
    mockHeroesApi((params) =>
      HttpResponse.json(
        buildPage(
          params.get('search') ? [] : [buildHero({ nickname: 'Hulk' })],
        ),
      ),
    );

    renderWithProviders(<HeroesPage />);
    await screen.findByRole('heading', { name: 'Hulk' });
    await userEvent.type(screen.getByLabelText('Buscar heróis'), 'xyz');

    expect(
      await screen.findByText('Nenhum herói encontrado'),
    ).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Limpar busca' }));
    expect(
      await screen.findByRole('heading', { name: 'Hulk' }),
    ).toBeInTheDocument();
  });

  it('shows an invitation when there are no heroes yet', async () => {
    mockHeroesApi(() => HttpResponse.json(buildPage([])));

    renderWithProviders(<HeroesPage />);

    expect(
      await screen.findByText('Nenhum herói forjado ainda'),
    ).toBeInTheDocument();
  });

  it('shows an error with a retry button when the API is unreachable', async () => {
    let attempts = 0;
    server.use(
      http.get('/api/heroes', () => {
        attempts += 1;
        return attempts === 1
          ? HttpResponse.error()
          : HttpResponse.json(buildPage([buildHero({ nickname: 'Hulk' })]));
      }),
    );

    renderWithProviders(<HeroesPage />);

    expect(await screen.findByText('A forja apagou')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Tentar novamente' }),
    );
    expect(
      await screen.findByRole('heading', { name: 'Hulk' }),
    ).toBeInTheDocument();
  });
});
