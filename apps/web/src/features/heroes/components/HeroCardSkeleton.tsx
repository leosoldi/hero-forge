import { Skeleton } from '@mantine/core';
import classes from './HeroCard.module.css';

export function HeroCardSkeleton() {
  return (
    <div className={classes.card} aria-hidden>
      <Skeleton className={classes.portrait} radius={0} />
      <div className={classes.body}>
        <Skeleton height={24} width="70%" radius="sm" />
        <Skeleton height={14} width="55%" radius="sm" />
        <Skeleton height={22} width="45%" radius="xl" mt={6} />
      </div>
    </div>
  );
}
