import { useCallback, useState } from 'react';
import type { Hero } from '../types';

export type HeroDialog =
  | { type: 'create' }
  | { type: 'edit'; hero: Hero }
  | { type: 'details'; hero: Hero }
  | { type: 'deactivate'; hero: Hero }
  | { type: 'activate'; hero: Hero }
  | null;

export function useHeroDialogs() {
  const [dialog, setDialog] = useState<HeroDialog>(null);

  const close = useCallback(() => setDialog(null), []);

  return {
    dialog,
    close,
    openCreate: () => setDialog({ type: 'create' }),
    openEdit: (hero: Hero) => setDialog({ type: 'edit', hero }),
    openDetails: (hero: Hero) => setDialog({ type: 'details', hero }),
    openDeactivate: (hero: Hero) => setDialog({ type: 'deactivate', hero }),
    openActivate: (hero: Hero) => setDialog({ type: 'activate', hero }),
  };
}

export function dialogHero(
  dialog: HeroDialog,
  type: Exclude<NonNullable<HeroDialog>['type'], 'create'>,
): Hero | null {
  return dialog?.type === type ? dialog.hero : null;
}
