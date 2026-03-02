import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveRefreshTokenHash1771785177351 implements MigrationInterface {
  name = 'RemoveRefreshTokenHash1771785177351';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "refresh_token_hash"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth" ADD "refresh_token_hash" character varying(64)`);
  }
}
