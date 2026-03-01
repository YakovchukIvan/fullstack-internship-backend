import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUserCompletedAtIndexToQuizAttempts1772379279373 implements MigrationInterface {
  name = 'AddUserCompletedAtIndexToQuizAttempts1772379279373';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_465dd700efa043785dc5ca79e3" ON "quiz_attempts" ("user_id", "completed_at") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_465dd700efa043785dc5ca79e3"`);
  }
}
