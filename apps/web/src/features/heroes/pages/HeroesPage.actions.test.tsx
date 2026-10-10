import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import type { Hero } from '../types';
import { buildHero, buildPage } from '../../../../test/fixtures/heroes';
import { server } from '../../../../test/msw-server';
import { renderWithProviders } from '../../../../test/render';
import { HeroesPage } from './HeroesPage';

function mockApi(initial: Hero[]) {
  let heroes = [...initial];
  const find = (id: string) => heroes.find((hero) => hero.id === id)!;
  const replace = (updated: Hero) => {
    heroes = heroes.map((hero) => (hero.id === updated.id ? updated : hero));
    return updated;
  };

  server.use(
    http.get('/api/heroes', () => HttpResponse.json(buildPage(heroes))),
    http.get('/api/heroes/:id', ({ params }) =>
      HttpResponse.json(find(String(params.id))),
    ),
    http.post('/api/heroes', async ({ request }) => {
      const hero = buildHero((await request.json()) as Partial<Hero>);
      heroes = [hero, ...heroes];
      return HttpResponse.json(hero, { status: 201 });
    }),
    http.delete('/api/heroes/:id', ({ params }) =>
      HttpResponse.json(
        replace({ ...find(String(params.id)), is_active: false }),
      ),
    ),
    http.patch('/api/heroes/:id/activate', ({ params }) =>
      HttpResponse.json(
        replace({ ...find(String(params.id)), is_active: true }),
      ),
    ),
  );
}

const card = (nickname: string, inactive = false) =>
  screen.findByRole('article', {
    name: inactive ? `${nickname} (inativo)` : nickname,
  });

describe('HeroesPage actions', () => {
  it('creates a hero from the "Forjar herói" button and refreshes the list', async () => {
    mockApi([buildHero({ nickname: 'Batman' })]);
    renderWithProviders(<HeroesPage />);
    await card('Batman');

    await userEvent.click(screen.getByRole('button', { name: 'Forjar herói' }));
    const dialog = await screen.findByRole('dialog');
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Nome completo' }),
      'Robert Bruce Banner',
    );
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Nome de guerra' }),
      'Hulk',
    );
    await userEvent.type(
      within(dialog).getByLabelText(/Data de nascimento/),
      '1962-04-10',
    );
    await userEvent.type(
      within(dialog).getByRole('combobox', { name: /Universo/ }),
      'Marvel',
    );
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Habilidade' }),
      'Force',
    );
    await userEvent.type(
      within(dialog).getByRole('textbox', { name: 'Avatar' }),
      'https://example.com/hulk.jpg',
    );
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Forjar herói' }),
    );

    expect(await card('Hulk')).toBeInTheDocument();
    expect(screen.getByText('Herói forjado')).toBeInTheDocument();
  });

  it('asks for confirmation before deleting and shows the hero as inactive', async () => {
    mockApi([buildHero({ nickname: 'Hulk' })]);
    renderWithProviders(<HeroesPage />);
    await card('Hulk');

    await userEvent.click(
      screen.getByRole('button', { name: 'Ações de Hulk' }),
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Excluir' }),
    );

    const dialog = await screen.findByRole('dialog', { name: 'Excluir herói' });
    expect(dialog).toHaveTextContent('Tem certeza que deseja excluir Hulk?');
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Excluir' }),
    );

    expect(await card('Hulk', true)).toHaveAttribute('data-inactive');
    expect(screen.getByText('Herói excluído')).toBeInTheDocument();
  });

  it('does not delete when the confirmation is cancelled', async () => {
    mockApi([buildHero({ nickname: 'Hulk' })]);
    renderWithProviders(<HeroesPage />);
    await card('Hulk');

    await userEvent.click(
      screen.getByRole('button', { name: 'Ações de Hulk' }),
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Excluir' }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Excluir herói' });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Cancelar' }),
    );

    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
    expect(await card('Hulk')).not.toHaveAttribute('data-inactive');
  });

  it('reactivates an inactive hero after confirmation', async () => {
    mockApi([buildHero({ nickname: 'Hulk', is_active: false })]);
    renderWithProviders(<HeroesPage />);
    await card('Hulk', true);

    await userEvent.click(
      screen.getByRole('button', { name: 'Ações de Hulk' }),
    );
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Ativar' }),
    );
    const dialog = await screen.findByRole('dialog', { name: 'Ativar herói' });
    await userEvent.click(
      within(dialog).getByRole('button', { name: 'Ativar' }),
    );

    expect(await card('Hulk')).not.toHaveAttribute('data-inactive');
    expect(screen.getByText('Herói ativado')).toBeInTheDocument();
  });

  it('opens the hero details when the card is clicked, and goes to edit from there', async () => {
    mockApi([buildHero({ nickname: 'Hulk', main_power: 'Force' })]);
    renderWithProviders(<HeroesPage />);
    await card('Hulk');

    await userEvent.click(
      screen.getByRole('button', { name: 'Ver detalhes de Hulk' }),
    );

    const details = await screen.findByRole('dialog');
    expect(details).toHaveTextContent('Ficha do herói');
    expect(details).toHaveTextContent('10/04/1962');
    expect(details).toHaveTextContent('Force');

    await userEvent.click(
      within(details).getByRole('button', { name: 'Editar' }),
    );
    expect(await screen.findByText('Editar herói')).toBeInTheDocument();
  });

  it('does not offer editing in the details of an inactive hero', async () => {
    mockApi([buildHero({ nickname: 'Hulk', is_active: false })]);
    renderWithProviders(<HeroesPage />);
    await card('Hulk', true);

    await userEvent.click(
      screen.getByRole('button', { name: 'Ver detalhes de Hulk' }),
    );

    const details = await screen.findByRole('dialog');
    expect(details).toHaveTextContent('Inativo');
    expect(
      within(details).queryByRole('button', { name: 'Editar' }),
    ).not.toBeInTheDocument();
  });
});
