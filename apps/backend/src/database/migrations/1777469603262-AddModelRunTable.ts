import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddModelRunTable1777469603262 implements MigrationInterface {
  name = 'AddModelRunTable1777469603262'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."model_run_result_status_enum" AS ENUM('SUCCESS', 'FAILURE', 'PARTIAL')`
    )
    await queryRunner.query(
      `CREATE TABLE "model_run" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid NOT NULL, "modelType" "public"."ai_activity_model_type_enum" NOT NULL, "modelId" uuid NOT NULL, "runId" integer NOT NULL, "selectionCount" integer NOT NULL, "executionStatus" "public"."activity_status_enum" NOT NULL, "resultStatus" "public"."model_run_result_status_enum", "aggregateConfidence" integer, "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "finishedAt" TIMESTAMP WITH TIME ZONE, "durationMs" integer, "errorMessage" text, CONSTRAINT "PK_1b66614ea6e6048ee8497f2a9de" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_model_run_seq" ON "model_run" ("modelType", "modelId", "runId") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_model_run_model" ON "model_run" ("modelType", "modelId") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_model_run_user" ON "model_run" ("userId") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_model_run_created" ON "model_run" ("createdAt") `
    )
    await queryRunner.query(`ALTER TABLE "activity" ADD "modelRunId" uuid`)
    await queryRunner.query(
      `CREATE INDEX "idx_activity_model_run" ON "activity" ("modelRunId") `
    )
    await queryRunner.query(
      `ALTER TABLE "model_run" ADD CONSTRAINT "FK_1618afaa28711b56ae23eed9684" FOREIGN KEY ("userId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_8cebfcbb2354c19f318c6a3ef84" FOREIGN KEY ("modelRunId") REFERENCES "model_run"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_8cebfcbb2354c19f318c6a3ef84"`
    )
    await queryRunner.query(
      `ALTER TABLE "model_run" DROP CONSTRAINT "FK_1618afaa28711b56ae23eed9684"`
    )
    await queryRunner.query(`DROP INDEX "public"."idx_activity_model_run"`)
    await queryRunner.query(`ALTER TABLE "activity" DROP COLUMN "modelRunId"`)
    await queryRunner.query(`DROP INDEX "public"."idx_model_run_created"`)
    await queryRunner.query(`DROP INDEX "public"."idx_model_run_user"`)
    await queryRunner.query(`DROP INDEX "public"."idx_model_run_model"`)
    await queryRunner.query(`DROP INDEX "public"."uq_model_run_seq"`)
    await queryRunner.query(`DROP TABLE "model_run"`)
    await queryRunner.query(`DROP TYPE "public"."model_run_result_status_enum"`)
  }
}
