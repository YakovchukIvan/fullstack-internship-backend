import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOAuthIdsToUsers1769704941084 implements MigrationInterface {
  name = 'AddOAuthIdsToUsers1769704941084';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth" ADD "google_id" character varying(64)`);
    await queryRunner.query(`ALTER TABLE "auth" ADD CONSTRAINT "UQ_54aaa5e6b9accb5ecd9bcec7dad" UNIQUE ("google_id")`);
    await queryRunner.query(`ALTER TABLE "auth" ADD "github_id" character varying(64)`);
    await queryRunner.query(`ALTER TABLE "auth" ADD CONSTRAINT "UQ_10f0bf18d3877f14256ad000caa" UNIQUE ("github_id")`);
    await queryRunner.query(`ALTER TABLE "auth" ALTER COLUMN "password_hash" DROP NOT NULL`);
    await queryRunner.query(`ALTER TABLE "auth" ADD CONSTRAINT "CHK_4f64b7fcf69a023d991cf73499" CHECK (
  "password_hash" IS NOT NULL 
  OR "google_id" IS NOT NULL 
  OR "github_id" IS NOT NULL
)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "auth" DROP CONSTRAINT "CHK_4f64b7fcf69a023d991cf73499"`);
    await queryRunner.query(`ALTER TABLE "auth" ALTER COLUMN "password_hash" SET NOT NULL`);
    await queryRunner.query(`ALTER TABLE "auth" DROP CONSTRAINT "UQ_10f0bf18d3877f14256ad000caa"`);
    await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "github_id"`);
    await queryRunner.query(`ALTER TABLE "auth" DROP CONSTRAINT "UQ_54aaa5e6b9accb5ecd9bcec7dad"`);
    await queryRunner.query(`ALTER TABLE "auth" DROP COLUMN "google_id"`);
  }
}
