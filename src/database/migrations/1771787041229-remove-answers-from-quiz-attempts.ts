import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveAnswersFromQuizAttempts1771787041229 implements MigrationInterface {
  name = 'RemoveAnswersFromQuizAttempts1771787041229';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quiz_attempts" DROP COLUMN "answers"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quiz_attempts" ADD "answers" jsonb NOT NULL`);
  }
}
