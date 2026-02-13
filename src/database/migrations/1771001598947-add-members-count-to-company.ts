import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMembersCountToCompany1771001598947 implements MigrationInterface {
  name = 'AddMembersCountToCompany1771001598947';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" ADD "membersCount" integer NOT NULL DEFAULT '1'`);
    await queryRunner.query(
      `ALTER TYPE "public"."company_join_requests_status_enum" RENAME TO "company_join_requests_status_enum_old"`,
    );
    await queryRunner.query(`CREATE TYPE "public"."company_join_requests_status_enum" AS ENUM('PENDING')`);
    await queryRunner.query(`ALTER TABLE "company_join_requests" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "company_join_requests" ALTER COLUMN "status" TYPE "public"."company_join_requests_status_enum" USING "status"::"text"::"public"."company_join_requests_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "company_join_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
    await queryRunner.query(`DROP TYPE "public"."company_join_requests_status_enum_old"`);
    await queryRunner.query(
      `ALTER TYPE "public"."company_invitations_status_enum" RENAME TO "company_invitations_status_enum_old"`,
    );
    await queryRunner.query(`CREATE TYPE "public"."company_invitations_status_enum" AS ENUM('PENDING')`);
    await queryRunner.query(`ALTER TABLE "company_invitations" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ALTER COLUMN "status" TYPE "public"."company_invitations_status_enum" USING "status"::"text"::"public"."company_invitations_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "company_invitations" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
    await queryRunner.query(`DROP TYPE "public"."company_invitations_status_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."company_invitations_status_enum_old" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELED')`,
    );
    await queryRunner.query(`ALTER TABLE "company_invitations" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ALTER COLUMN "status" TYPE "public"."company_invitations_status_enum_old" USING "status"::"text"::"public"."company_invitations_status_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "company_invitations" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
    await queryRunner.query(`DROP TYPE "public"."company_invitations_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."company_invitations_status_enum_old" RENAME TO "company_invitations_status_enum"`,
    );
    await queryRunner.query(
      `CREATE TYPE "public"."company_join_requests_status_enum_old" AS ENUM('PENDING', 'ACCEPTED', 'DECLINED', 'CANCELED')`,
    );
    await queryRunner.query(`ALTER TABLE "company_join_requests" ALTER COLUMN "status" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "company_join_requests" ALTER COLUMN "status" TYPE "public"."company_join_requests_status_enum_old" USING "status"::"text"::"public"."company_join_requests_status_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "company_join_requests" ALTER COLUMN "status" SET DEFAULT 'PENDING'`);
    await queryRunner.query(`DROP TYPE "public"."company_join_requests_status_enum"`);
    await queryRunner.query(
      `ALTER TYPE "public"."company_join_requests_status_enum_old" RENAME TO "company_join_requests_status_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "membersCount"`);
  }
}
