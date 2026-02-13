import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompaniesInvitationsRequests1771019284775 implements MigrationInterface {
  name = 'CreateCompaniesInvitationsRequests1771019284775';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."company_join_requests_status_enum" AS ENUM('PENDING')`);
    await queryRunner.query(
      `CREATE TABLE "company_join_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "company_id" uuid NOT NULL, "status" "public"."company_join_requests_status_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "UQ_ac8d61d1ad068d77b072db246f3" UNIQUE ("user_id", "company_id"), CONSTRAINT "PK_b35a2a82abf7887e483d01d965a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_9276566d4cdef92007de5a8ef6" ON "company_join_requests" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_5a9df0162d77b218c437c5bb2f" ON "company_join_requests" ("company_id") `);
    await queryRunner.query(`CREATE TYPE "public"."company_invitations_status_enum" AS ENUM('PENDING')`);
    await queryRunner.query(
      `CREATE TABLE "company_invitations" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "company_id" uuid NOT NULL, "invited_by" uuid NOT NULL, "message" text, "status" "public"."company_invitations_status_enum" NOT NULL DEFAULT 'PENDING', CONSTRAINT "UQ_bb6089589451e24d5f8e8e6151f" UNIQUE ("user_id", "company_id"), CONSTRAINT "PK_f73da096e85d9dcfaee9fb4ea5e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_87e1c1cf7f91d39ded9abedc46" ON "company_invitations" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_299a0145ecb210cee972d1cc3c" ON "company_invitations" ("company_id") `);
    await queryRunner.query(`ALTER TABLE "companies" ADD "membersCount" integer NOT NULL DEFAULT '1'`);
    await queryRunner.query(`CREATE INDEX "IDX_cbbdf4794f8aac4144be2d6e64" ON "companies" ("is_visible") `);
    await queryRunner.query(
      `ALTER TABLE "company_join_requests" ADD CONSTRAINT "FK_9276566d4cdef92007de5a8ef6d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_join_requests" ADD CONSTRAINT "FK_5a9df0162d77b218c437c5bb2f0" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_87e1c1cf7f91d39ded9abedc469" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_299a0145ecb210cee972d1cc3c8" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD CONSTRAINT "FK_ae5d05a58591a6715bfa5768f87" FOREIGN KEY ("invited_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_ae5d05a58591a6715bfa5768f87"`);
    await queryRunner.query(`ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_299a0145ecb210cee972d1cc3c8"`);
    await queryRunner.query(`ALTER TABLE "company_invitations" DROP CONSTRAINT "FK_87e1c1cf7f91d39ded9abedc469"`);
    await queryRunner.query(`ALTER TABLE "company_join_requests" DROP CONSTRAINT "FK_5a9df0162d77b218c437c5bb2f0"`);
    await queryRunner.query(`ALTER TABLE "company_join_requests" DROP CONSTRAINT "FK_9276566d4cdef92007de5a8ef6d"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_cbbdf4794f8aac4144be2d6e64"`);
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "membersCount"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_299a0145ecb210cee972d1cc3c"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_87e1c1cf7f91d39ded9abedc46"`);
    await queryRunner.query(`DROP TABLE "company_invitations"`);
    await queryRunner.query(`DROP TYPE "public"."company_invitations_status_enum"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_5a9df0162d77b218c437c5bb2f"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9276566d4cdef92007de5a8ef6"`);
    await queryRunner.query(`DROP TABLE "company_join_requests"`);
    await queryRunner.query(`DROP TYPE "public"."company_join_requests_status_enum"`);
  }
}
