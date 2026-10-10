import { Column, Entity, Index, PrimaryColumn } from 'typeorm';
import { HERO_CONSTRAINTS } from '../../domain/hero.constraints.js';

@Entity('heroes')
@Index('IDX_heroes_created_at', ['createdAt'])
export class HeroOrmEntity {
  @PrimaryColumn({ type: 'char', length: 36 })
  id: string;

  @Column({ type: 'varchar', length: HERO_CONSTRAINTS.NAME_MAX_LENGTH })
  name: string;

  @Column({ type: 'varchar', length: HERO_CONSTRAINTS.NICKNAME_MAX_LENGTH })
  nickname: string;

  @Column({ name: 'date_of_birth', type: 'date', utc: true })
  dateOfBirth: string;

  @Column({ type: 'varchar', length: HERO_CONSTRAINTS.UNIVERSE_MAX_LENGTH })
  universe: string;

  @Column({
    name: 'main_power',
    type: 'varchar',
    length: HERO_CONSTRAINTS.MAIN_POWER_MAX_LENGTH,
  })
  mainPower: string;

  @Column({
    name: 'avatar_url',
    type: 'varchar',
    length: HERO_CONSTRAINTS.AVATAR_URL_MAX_LENGTH,
  })
  avatarUrl: string;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  @Column({ name: 'created_at', type: 'datetime', precision: 3 })
  createdAt: Date;

  @Column({ name: 'updated_at', type: 'datetime', precision: 3 })
  updatedAt: Date;
}
