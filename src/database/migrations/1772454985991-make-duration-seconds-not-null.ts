import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeDurationSecondsNotNull1772454985991 implements MigrationInterface {
  name = 'MakeDurationSecondsNotNull1772454985991';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quiz_attempts" ALTER COLUMN "duration_seconds" SET NOT NULL`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quiz_attempts" ALTER COLUMN "duration_seconds" DROP NOT NULL`);
  }
}
