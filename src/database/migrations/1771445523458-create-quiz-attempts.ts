import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateQuizAttempts1771445523458 implements MigrationInterface {
  name = 'CreateQuizAttempts1771445523458';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_companies_slug"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_companies_owner_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_quizzes_company_id"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_quizzes_created_by_user_id"`);
    await queryRunner.query(
      `CREATE TABLE "quiz_attempts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "user_id" uuid NOT NULL, "quiz_id" uuid NOT NULL, "company_id" uuid NOT NULL, "total_points" double precision NOT NULL, "max_possible_points" integer NOT NULL, "answers" jsonb NOT NULL, "completed_at" TIMESTAMP WITH TIME ZONE NOT NULL, "duration_seconds" integer, CONSTRAINT "PK_a84a93fb092359516dc5b325b90" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_4f84bd90d86f125a30ea81e81a" ON "quiz_attempts" ("user_id", "quiz_id") `);
    await queryRunner.query(
      `CREATE INDEX "IDX_c2791ec26845ff6489829b1331" ON "quiz_attempts" ("user_id", "company_id") `,
    );
    await queryRunner.query(`CREATE INDEX "IDX_83aac80eda4ae2fa3d60e364fb" ON "quiz_attempts" ("company_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_a720e260138b64fcff2fca19b2" ON "quiz_attempts" ("quiz_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_1701aaf48f6a78e96bfe08dd39" ON "quiz_attempts" ("user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_df63e1563bbd91b428b5c50d8a" ON "companies" ("owner_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_b28b07d25e4324eee577de5496" ON "companies" ("slug") `);
    await queryRunner.query(`CREATE INDEX "IDX_35284ec2672f561c3c4a759ea2" ON "quizzes" ("created_by_user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_3ea83aabeb8ce48f5659d337d3" ON "quizzes" ("company_id") `);
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_1701aaf48f6a78e96bfe08dd395" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_a720e260138b64fcff2fca19b2d" FOREIGN KEY ("quiz_id") REFERENCES "quizzes"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD CONSTRAINT "FK_83aac80eda4ae2fa3d60e364fba" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_83aac80eda4ae2fa3d60e364fba"`);
    await queryRunner.query(`ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_a720e260138b64fcff2fca19b2d"`);
    await queryRunner.query(`ALTER TABLE "quiz_attempts" DROP CONSTRAINT "FK_1701aaf48f6a78e96bfe08dd395"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_3ea83aabeb8ce48f5659d337d3"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_35284ec2672f561c3c4a759ea2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_b28b07d25e4324eee577de5496"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_df63e1563bbd91b428b5c50d8a"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_1701aaf48f6a78e96bfe08dd39"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_a720e260138b64fcff2fca19b2"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_83aac80eda4ae2fa3d60e364fb"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_c2791ec26845ff6489829b1331"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_4f84bd90d86f125a30ea81e81a"`);
    await queryRunner.query(`DROP TABLE "quiz_attempts"`);
    await queryRunner.query(`CREATE INDEX "IDX_quizzes_created_by_user_id" ON "quizzes" ("created_by_user_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_quizzes_company_id" ON "quizzes" ("company_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_companies_owner_id" ON "companies" ("owner_id") `);
    await queryRunner.query(`CREATE INDEX "IDX_companies_slug" ON "companies" ("slug") `);
  }
}
