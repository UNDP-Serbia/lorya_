import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddActivityTable1777338506841 implements MigrationInterface {
  name = 'AddActivityTable1777338506841'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."activity_category_enum" AS ENUM('MODEL_RUN', 'MANUAL_OPERATION')`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."activity_operation_enum" AS ENUM('LAYOUT_IDENTIFICATION', 'IMAGE_ENHANCEMENT', 'OCR', 'POST_OCR_CORRECTION', 'ROTATE', 'CROP', 'BRIGHTNESS_ADJUST', 'CONTRAST_ADJUST', 'SHARPNESS_ADJUST', 'PDF_SPLIT', 'SEGMENT_ADD', 'SEGMENT_RESHAPE', 'SEGMENT_DELETE', 'SEGMENT_LABEL_CHANGE', 'SEGMENT_REORDER', 'SEGMENT_REVERT', 'SEGMENTS_CROP', 'OCR_TEXT_EDIT', 'POST_OCR_TEXT_EDIT', 'LAYOUT_IDENTIFICATION_REVERT', 'IMAGE_ENHANCEMENT_REVERT', 'OCR_REVERT', 'POST_OCR_REVERT', 'FILE_RESET')`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."activity_status_enum" AS ENUM('IN_PROGRESS', 'SUCCESS', 'FAILURE')`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."ai_activity_model_type_enum" AS ENUM('LAYOUT_IDENTIFICATION', 'IMAGE_ENHANCEMENT', 'OCR', 'POST_OCR_CORRECTION')`
    )
    await queryRunner.query(
      `CREATE TABLE "activity" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "fileId" uuid NOT NULL, "userId" uuid NOT NULL, "category" "public"."activity_category_enum" NOT NULL, "operation" "public"."activity_operation_enum" NOT NULL, "status" "public"."activity_status_enum" NOT NULL, "modelType" "public"."ai_activity_model_type_enum", "modelId" uuid, "segmentId" uuid, "startedAt" TIMESTAMP WITH TIME ZONE NOT NULL, "finishedAt" TIMESTAMP WITH TIME ZONE, "durationMs" integer, "exitCode" integer, "errorMessage" text, "metadata" jsonb, CONSTRAINT "PK_24625a1d6b1b089c8ae206fe467" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "idx_activity_model" ON "activity" ("modelType", "modelId") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_activity_user" ON "activity" ("userId") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_activity_category_created" ON "activity" ("category", "createdAt") `
    )
    await queryRunner.query(
      `CREATE INDEX "idx_activity_file_created" ON "activity" ("fileId", "createdAt") `
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_ae9efb83d44909ba3210d7d909e" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea" FOREIGN KEY ("userId") REFERENCES "accounts"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" ADD CONSTRAINT "FK_fbf4b9af2b72c51ca71d27a6c23" FOREIGN KEY ("segmentId") REFERENCES "segments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_fbf4b9af2b72c51ca71d27a6c23"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_3571467bcbe021f66e2bdce96ea"`
    )
    await queryRunner.query(
      `ALTER TABLE "activity" DROP CONSTRAINT "FK_ae9efb83d44909ba3210d7d909e"`
    )
    await queryRunner.query(`DROP INDEX "public"."idx_activity_file_created"`)
    await queryRunner.query(
      `DROP INDEX "public"."idx_activity_category_created"`
    )
    await queryRunner.query(`DROP INDEX "public"."idx_activity_user"`)
    await queryRunner.query(`DROP INDEX "public"."idx_activity_model"`)
    await queryRunner.query(`DROP TABLE "activity"`)
    await queryRunner.query(`DROP TYPE "public"."ai_activity_model_type_enum"`)
    await queryRunner.query(`DROP TYPE "public"."activity_status_enum"`)
    await queryRunner.query(`DROP TYPE "public"."activity_operation_enum"`)
    await queryRunner.query(`DROP TYPE "public"."activity_category_enum"`)
  }
}
