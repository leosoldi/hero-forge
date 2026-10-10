import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { buildHero } from '../../../../test/fixtures/heroes';
import { renderWithProviders } from '../../../../test/render';
import { HeroCard } from './HeroCard';

describe('HeroCard', () => {
  it('shows the hero main information', () => {
    const hero = buildHero({
      nickname: 'Hulk',
      name: 'Robert Bruce Banner',
      universe: 'Marvel',
      main_power: 'Force',
    });

    renderWithProviders(<HeroCard hero={hero} />);

    expect(screen.getByRole('heading', { name: 'Hulk' })).toBeInTheDocument();
    expect(screen.getByText('Robert Bruce Banner')).toBeInTheDocument();
    expect(screen.getByText('Marvel')).toBeInTheDocument();
    expect(screen.getByText('Force')).toBeInTheDocument();
    expect(screen.queryByText('Inativo')).not.toBeInTheDocument();
  });

  it('marks inactive heroes visually and for screen readers', () => {
    const hero = buildHero({ nickname: 'Hulk', is_active: false });

    renderWithProviders(<HeroCard hero={hero} />);

    const card = screen.getByRole('article', { name: 'Hulk (inativo)' });
    expect(card).toHaveAttribute('data-inactive');
    expect(screen.getByText('Inativo')).toBeInTheDocument();
  });

  it('calls onOpen when the card is clicked', async () => {
    const hero = buildHero({ nickname: 'Hulk' });
    const onOpen = vi.fn();

    renderWithProviders(<HeroCard hero={hero} onOpen={onOpen} />);
    await userEvent.click(
      screen.getByRole('button', { name: 'Ver detalhes de Hulk' }),
    );

    expect(onOpen).toHaveBeenCalledWith(hero);
  });
});
