import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateNotifications1772737029014 implements MigrationInterface {
  name = 'CreateNotifications1772737029014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum" RENAME TO "notifications_type_enum_old"`);
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum" AS ENUM('quiz_created', 'invitation_received', 'invitation_accepted', 'join_request_sent', 'join_request_accepted')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum" USING "type"::"text"::"public"."notifications_type_enum"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum_old"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notifications_type_enum_old" AS ENUM('quiz_created', 'invitation_received', 'invitation_accepted', 'join_request_created', 'join_request_accepted')`,
    );
    await queryRunner.query(
      `ALTER TABLE "notifications" ALTER COLUMN "type" TYPE "public"."notifications_type_enum_old" USING "type"::"text"::"public"."notifications_type_enum_old"`,
    );
    await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
    await queryRunner.query(`ALTER TYPE "public"."notifications_type_enum_old" RENAME TO "notifications_type_enum"`);
  }
}
