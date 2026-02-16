import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizzes1771277228818 implements MigrationInterface {
  name = 'CreateQuizzes1771277228818';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "quizzes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "title" character varying(255) NOT NULL, "description" text, "frequency_in_days" integer NOT NULL, "questions" jsonb NOT NULL, "company_id" uuid NOT NULL, "is_ai_generated" boolean NOT NULL DEFAULT false, "ai_prompt" character varying, "ai_metadata" jsonb, CONSTRAINT "PK_b24f0f7662cf6b3a0e7dba0a1b4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "quizzes" ADD CONSTRAINT "FK_3ea83aabeb8ce48f5659d337d37" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quizzes" DROP CONSTRAINT "FK_3ea83aabeb8ce48f5659d337d37"`);
    await queryRunner.query(`DROP TABLE "quizzes"`);
  }
}
