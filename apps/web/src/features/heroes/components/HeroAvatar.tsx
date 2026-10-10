import { useState } from 'react';
import { universeColor } from '../lib/universe-color';
import type { Hero } from '../types';
import classes from './HeroAvatar.module.css';

interface HeroAvatarProps {
  hero: Pick<Hero, 'nickname' | 'universe' | 'avatar_url'>;
  className?: string;
}

type ImageStatus = 'loading' | 'loaded' | 'failed';

export function HeroAvatar({ hero, className }: HeroAvatarProps) {
  const [image, setImage] = useState<{ url: string; status: ImageStatus }>({
    url: hero.avatar_url,
    status: 'loading',
  });
  const status = image.url === hero.avatar_url ? image.status : 'loading';
  const color = universeColor(hero.universe);

  return (
    <div
      className={`${classes.avatar} ${className ?? ''}`}
      style={{ backgroundColor: color.tint, color: color.ink }}
    >
      <span className={classes.monogram} aria-hidden>
        {hero.nickname.trim().charAt(0).toUpperCase() || '?'}
      </span>

      {hero.avatar_url && status !== 'failed' && (
        <img
          src={hero.avatar_url}
          alt={`Avatar de ${hero.nickname}`}
          className={classes.image}
          data-loaded={status === 'loaded' || undefined}
          loading="lazy"
          onLoad={() => setImage({ url: hero.avatar_url, status: 'loaded' })}
          onError={() => setImage({ url: hero.avatar_url, status: 'failed' })}
        />
      )}
    </div>
  );
}
