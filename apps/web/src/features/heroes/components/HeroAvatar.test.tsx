import { fireEvent, screen } from '@testing-library/react';
import { renderWithProviders } from '../../../../test/render';
import { HeroAvatar } from './HeroAvatar';

const hero = {
  nickname: 'hulk',
  universe: 'Marvel',
  avatar_url: 'https://example.com/hulk.jpg',
};

describe('HeroAvatar', () => {
  it('renders the avatar image', () => {
    renderWithProviders(<HeroAvatar hero={hero} />);

    expect(screen.getByRole('img', { name: 'Avatar de hulk' })).toHaveAttribute(
      'src',
      hero.avatar_url,
    );
  });

  it('falls back to the nickname initial when the image fails', () => {
    const { container } = renderWithProviders(<HeroAvatar hero={hero} />);

    fireEvent.error(screen.getByRole('img'));

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container).toHaveTextContent('H');
  });
});
