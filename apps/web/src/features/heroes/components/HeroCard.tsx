import type { ReactNode } from 'react';
import { IconBolt } from '@tabler/icons-react';
import { universeColor } from '../lib/universe-color';
import type { Hero } from '../types';
import { HeroAvatar } from './HeroAvatar';
import classes from './HeroCard.module.css';

interface HeroCardProps {
  hero: Hero;
  onOpen?: (hero: Hero) => void;
  actions?: ReactNode;
}

export function HeroCard({ hero, onOpen, actions }: HeroCardProps) {
  const color = universeColor(hero.universe);
  const inactive = !hero.is_active;

  return (
    <article
      className={classes.card}
      data-inactive={inactive || undefined}
      aria-label={`${hero.nickname}${inactive ? ' (inativo)' : ''}`}
    >
      <div className={classes.portrait}>
        <HeroAvatar hero={hero} className={classes.avatar} />

        <span className={classes.universe}>
          <span
            className={classes.universeDot}
            style={{ backgroundColor: color.accent }}
          />
          {hero.universe}
        </span>

        {inactive && <span className={classes.stamp}>Inativo</span>}
      </div>

      <div className={classes.body}>
        <h3 className={classes.nickname}>{hero.nickname}</h3>
        <p className={classes.name}>{hero.name}</p>
        <span className={classes.power}>
          <IconBolt size={13} stroke={2.2} aria-hidden />
          {hero.main_power}
        </span>
      </div>

      {onOpen && (
        <button
          type="button"
          className={classes.open}
          onClick={() => onOpen(hero)}
          aria-label={`Ver detalhes de ${hero.nickname}`}
        />
      )}

      {actions && <div className={classes.actions}>{actions}</div>}
    </article>
  );
}
