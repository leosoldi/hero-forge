import { ActionIcon, Menu } from '@mantine/core';
import {
  IconDotsVertical,
  IconPencil,
  IconPower,
  IconTrash,
} from '@tabler/icons-react';
import type { Hero } from '../types';

interface HeroActionsMenuProps {
  hero: Hero;
  onEdit: (hero: Hero) => void;
  onDelete: (hero: Hero) => void;
  onActivate: (hero: Hero) => void;
}

export function HeroActionsMenu({
  hero,
  onEdit,
  onDelete,
  onActivate,
}: HeroActionsMenuProps) {
  return (
    <Menu position="bottom-end" width={200} withinPortal>
      <Menu.Target>
        <ActionIcon
          variant="default"
          size={40}
          radius="md"
          aria-label={`Ações de ${hero.nickname}`}
        >
          <IconDotsVertical size={20} />
        </ActionIcon>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          leftSection={<IconPencil size={18} />}
          onClick={() => onEdit(hero)}
          disabled={!hero.is_active}
          title={
            hero.is_active
              ? undefined
              : 'Heróis inativos não podem ser editados'
          }
        >
          Editar
        </Menu.Item>

        {hero.is_active ? (
          <Menu.Item
            color="red"
            leftSection={<IconTrash size={18} />}
            onClick={() => onDelete(hero)}
          >
            Excluir
          </Menu.Item>
        ) : (
          <Menu.Item
            color="teal"
            leftSection={<IconPower size={18} />}
            onClick={() => onActivate(hero)}
          >
            Ativar
          </Menu.Item>
        )}
      </Menu.Dropdown>
    </Menu>
  );
}
