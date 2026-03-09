import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotifications1772737029014 implements MigrationInterface {
  name = 'CreateNotifications1772737029014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('quiz_created', 'invitation_received', 'invitation_accepted', 'join_request_sent', 'join_request_accepted')`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "type" "public"."notifications_type_enum" NOT NULL, "text" text NOT NULL, "is_read" boolean NOT NULL DEFAULT false, "company_id" uuid, CONSTRAINT "PK_notifications" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_notifications_user_id" ON "notifications" ("user_id")`);
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_notifications_user_id" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_notifications_user_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_notifications_user_id"`);
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
  }
}
