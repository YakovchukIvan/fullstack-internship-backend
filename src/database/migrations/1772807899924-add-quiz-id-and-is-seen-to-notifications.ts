import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddQuizIdAndIsSeenToNotifications1772807899924 implements MigrationInterface {
  name = 'AddQuizIdAndIsSeenToNotifications1772807899924';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" ADD "is_seen" boolean NOT NULL DEFAULT false`);
    await queryRunner.query(`ALTER TABLE "notifications" ADD "quiz_id" uuid`);
    await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('quiz_created', 'quiz_available', 'quiz_available_tomorrow', 'invitation_received', 'invitation_accepted', 'join_request_sent', 'join_request_accepted')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);
    await queryRunner.query(`CREATE INDEX "IDX_ae2625562c7b38a14e059ac948" ON "notifications" ("user_id", "is_seen") `);
    await queryRunner.query(
      `ALTER TABLE "notifications" ADD CONSTRAINT "FK_03c3a1a5a6d71d0fd1acbc9b580" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_03c3a1a5a6d71d0fd1acbc9b580"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_ae2625562c7b38a14e059ac948"`);
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum_old" AS ENUM('quiz_created', 'invitation_received', 'invitation_accepted', 'join_request_sent', 'join_request_accepted')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum_old" USING "type"::"text"::"public"."notifications_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum_old" RENAME TO "notifications_type_enum"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "quiz_id"`);
    await queryRunner.query(`ALTER TABLE "notifications" DROP COLUMN "is_seen"`);
  }
}
