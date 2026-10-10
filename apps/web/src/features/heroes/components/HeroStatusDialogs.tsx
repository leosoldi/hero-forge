import { getErrorMessage } from '../../../shared/api/error-messages';
import { ConfirmModal } from '../../../shared/ui/ConfirmModal';
import { useRetainedValue } from '../../../shared/lib/use-retained-value';
import { notify } from '../../../shared/ui/notify';
import { useActivateHero, useDeactivateHero } from '../api/heroes.queries';
import { HERO_ERROR_MESSAGES } from '../lib/hero-error-messages';
import type { Hero } from '../types';

interface DialogProps {
  hero: Hero | null;
  onClose: () => void;
}

export function DeactivateHeroDialog({ hero: heroProp, onClose }: DialogProps) {
  const hero = useRetainedValue(heroProp, Boolean(heroProp));
  const deactivate = useDeactivateHero();

  const confirm = async () => {
    if (!hero) return;
    try {
      await deactivate.mutateAsync(hero.id);
      notify.success(
        `${hero.nickname} foi excluído e pode ser reativado quando quiser.`,
        'Herói excluído',
      );
      onClose();
    } catch (error) {
      notify.error(getErrorMessage(error, HERO_ERROR_MESSAGES));
    }
  };

  return (
    <ConfirmModal
      opened={Boolean(heroProp)}
      title="Excluir herói"
      message={
        <>
          Tem certeza que deseja excluir <strong>{hero?.nickname}</strong>? Ele
          ficará inativo na listagem e poderá ser reativado depois.
        </>
      }
      confirmLabel="Excluir"
      confirmColor="red"
      loading={deactivate.isPending}
      onConfirm={confirm}
      onClose={onClose}
    />
  );
}

export function ActivateHeroDialog({ hero: heroProp, onClose }: DialogProps) {
  const hero = useRetainedValue(heroProp, Boolean(heroProp));
  const activate = useActivateHero();

  const confirm = async () => {
    if (!hero) return;
    try {
      await activate.mutateAsync(hero.id);
      notify.success(
        `${hero.nickname} está de volta à ativa.`,
        'Herói ativado',
      );
      onClose();
    } catch (error) {
      notify.error(getErrorMessage(error, HERO_ERROR_MESSAGES));
    }
  };

  return (
    <ConfirmModal
      opened={Boolean(heroProp)}
      title="Ativar herói"
      message={
        <>
          Deseja ativar <strong>{hero?.nickname}</strong> novamente? Ele voltará
          a poder ser editado.
        </>
      }
      confirmLabel="Ativar"
      confirmColor="teal"
      loading={activate.isPending}
      onConfirm={confirm}
      onClose={onClose}
    />
  );
}
