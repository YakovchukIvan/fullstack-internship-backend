import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTimeLimitMinutesToQuiz1772535297370 implements MigrationInterface {
  name = 'AddTimeLimitMinutesToQuiz1772535297370';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quizzes" ADD "time_limit_minutes" integer NOT NULL DEFAULT '30'`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quizzes" DROP COLUMN "time_limit_minutes"`);
  }
}
