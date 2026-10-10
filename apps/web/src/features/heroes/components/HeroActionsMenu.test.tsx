import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildHero } from '../../../../test/fixtures/heroes';
import { renderWithProviders } from '../../../../test/render';
import { HeroActionsMenu } from './HeroActionsMenu';

const setup = (isActive: boolean) => {
  const hero = buildHero({ nickname: 'Hulk', is_active: isActive });
  const handlers = { onEdit: vi.fn(), onDelete: vi.fn(), onActivate: vi.fn() };
  renderWithProviders(<HeroActionsMenu hero={hero} {...handlers} />);
  return { hero, ...handlers };
};

const openMenu = () =>
  userEvent.click(screen.getByRole('button', { name: 'Ações de Hulk' }));

describe('HeroActionsMenu', () => {
  it('offers Editar and Excluir for active heroes', async () => {
    const { hero, onEdit, onDelete } = setup(true);
    await openMenu();

    expect(
      screen.queryByRole('menuitem', { name: 'Ativar' }),
    ).not.toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Excluir' }),
    );
    expect(onDelete).toHaveBeenCalledWith(hero);

    await openMenu();
    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Editar' }),
    );
    expect(onEdit).toHaveBeenCalledWith(hero);
  });

  it('replaces Excluir with Ativar and disables Editar for inactive heroes', async () => {
    const { hero, onActivate } = setup(false);
    await openMenu();

    expect(
      screen.queryByRole('menuitem', { name: 'Excluir' }),
    ).not.toBeInTheDocument();
    expect(
      await screen.findByRole('menuitem', { name: 'Editar' }),
    ).toBeDisabled();

    await userEvent.click(
      await screen.findByRole('menuitem', { name: 'Ativar' }),
    );
    expect(onActivate).toHaveBeenCalledWith(hero);
  });
});
