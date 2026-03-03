import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveUpdatedAtFromAttemptsAndInvitationsAndQuizzes1772545051568 implements MigrationInterface {
  name = 'RemoveUpdatedAtFromAttemptsAndInvitationsAndQuizzes1772545051568';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "quiz_attempts" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "company_join_requests" DROP COLUMN "updated_at"`);
    await queryRunner.query(`ALTER TABLE "company_invitations" DROP COLUMN "updated_at"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "company_invitations" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "company_join_requests" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(
      `ALTER TABLE "quiz_attempts" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
  }
}
