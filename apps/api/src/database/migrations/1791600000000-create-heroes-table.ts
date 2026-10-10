import {
  type MigrationInterface,
  type QueryRunner,
  Table,
  TableIndex,
} from 'typeorm';

export class CreateHeroesTable1791600000000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'heroes',
        columns: [
          { name: 'id', type: 'char', length: '36', isPrimary: true },
          { name: 'name', type: 'varchar', length: '120' },
          { name: 'nickname', type: 'varchar', length: '80' },
          { name: 'date_of_birth', type: 'date' },
          { name: 'universe', type: 'varchar', length: '60' },
          { name: 'main_power', type: 'varchar', length: '120' },
          { name: 'avatar_url', type: 'varchar', length: '2048' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'datetime', precision: 3 },
          { name: 'updated_at', type: 'datetime', precision: 3 },
        ],
      }),
    );

    await queryRunner.createIndex(
      'heroes',
      new TableIndex({
        name: 'IDX_heroes_created_at',
        columnNames: ['created_at'],
      }),
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('heroes');
  }
}
