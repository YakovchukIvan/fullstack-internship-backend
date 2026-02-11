import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateCompanies1770731621752 implements MigrationInterface {
  name = 'CreateCompanies1770731621752';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."company_members_role_enum" AS ENUM('owner', 'admin', 'member')`);
    await queryRunner.query(
      `CREATE TABLE "company_members" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "company_id" uuid NOT NULL, "role" "public"."company_members_role_enum" NOT NULL, CONSTRAINT "UQ_6e865dcafa308a5a7825d8de5c5" UNIQUE ("user_id", "company_id"), CONSTRAINT "PK_b159163d9222448886158bc5385" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_535b42b6c7557886fd1c44501e" ON "company_members" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_e33a61fd560f6412d3ffb39f22" ON "company_members" ("company_id") `);
    await queryRunner.query(
      `CREATE TABLE "companies" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "slug" character varying(255) NOT NULL, "description" text, "avatar_url" character varying(500), "is_visible" boolean NOT NULL DEFAULT true, "owner_id" uuid NOT NULL, CONSTRAINT "UQ_3dacbb3eb4f095e29372ff8e131" UNIQUE ("name"), CONSTRAINT "UQ_b28b07d25e4324eee577de5496d" UNIQUE ("slug"), CONSTRAINT "PK_d4bc3e82a314fa9e29f652c2c22" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`ALTER TYPE "public"."users_role_enum" RENAME TO "users_role_enum_old"`);
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('user', 'owner')`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum" USING "role"::"text"::"public"."users_role_enum"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum_old"`);
    await queryRunner.query(
      `ALTER TABLE "company_members" ADD CONSTRAINT "FK_535b42b6c7557886fd1c44501e4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_members" ADD CONSTRAINT "FK_e33a61fd560f6412d3ffb39f225" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "companies" ADD CONSTRAINT "FK_df63e1563bbd91b428b5c50d8ad" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "companies" DROP CONSTRAINT "FK_df63e1563bbd91b428b5c50d8ad"`);
    await queryRunner.query(`ALTER TABLE "company_members" DROP CONSTRAINT "FK_e33a61fd560f6412d3ffb39f225"`);
    await queryRunner.query(`ALTER TABLE "company_members" DROP CONSTRAINT "FK_535b42b6c7557886fd1c44501e4"`);
    await queryRunner.query(`CREATE TYPE "public"."users_role_enum_old" AS ENUM('user', 'admin', 'owner')`);
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" DROP DEFAULT`);
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "role" TYPE "public"."users_role_enum_old" USING "role"::"text"::"public"."users_role_enum_old"`,
    );
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'user'`);
    await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."users_role_enum_old" RENAME TO "users_role_enum"`);
    await queryRunner.query(`DROP TABLE "companies"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_e33a61fd560f6412d3ffb39f22"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_535b42b6c7557886fd1c44501e"`);
    await queryRunner.query(`DROP TABLE "company_members"`);
    await queryRunner.query(`DROP TYPE "public"."company_members_role_enum"`);
  }
}
