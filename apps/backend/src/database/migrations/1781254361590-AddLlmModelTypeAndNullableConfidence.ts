import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddLlmModelTypeAndNullableConfidence1781254361590 implements MigrationInterface {
  name = 'AddLlmModelTypeAndNullableConfidence1781254361590'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."ocr_models_type_enum" ADD VALUE IF NOT EXISTS 'LITELLM'`
    )
    await queryRunner.query(
      `ALTER TYPE "public"."post_ocr_correction_models_type_enum" ADD VALUE IF NOT EXISTS 'LITELLM'`
    )
    await queryRunner.query(
      `ALTER TABLE "ocr_results" ALTER COLUMN "avgWordConfidence" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_results" ALTER COLUMN "avgWordConfidence" DROP NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Postgres cannot remove an enum value without recreating the type, so the
    // 'LITELLM' value intentionally remains after rollback; only the NOT NULL
    // constraints are restored here.
    await queryRunner.query(
      `ALTER TABLE "ocr_results" ALTER COLUMN "avgWordConfidence" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_results" ALTER COLUMN "avgWordConfidence" SET NOT NULL`
    )
  }
}
