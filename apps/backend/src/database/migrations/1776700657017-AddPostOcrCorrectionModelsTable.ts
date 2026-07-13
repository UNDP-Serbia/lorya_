import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPostOcrCorrectionModelsTable1776700657017 implements MigrationInterface {
  name = 'AddPostOcrCorrectionModelsTable1776700657017'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."post_ocr_correction_models_type_enum" AS ENUM('BUILTIN', 'HUGGINGFACE')`
    )
    await queryRunner.query(
      `CREATE TABLE "post_ocr_correction_models" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "description" text, "type" "public"."post_ocr_correction_models_type_enum" NOT NULL, "reference" character varying(512), "configFilePath" character varying(512), "inputMapperFilePath" character varying(512), "outputMapperFilePath" character varying(512), CONSTRAINT "PK_95c430aff1d838c04ac995fde3a" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_59fed59de20560ef48a26746c9" ON "post_ocr_correction_models" ("name") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_59fed59de20560ef48a26746c9"`
    )
    await queryRunner.query(`DROP TABLE "post_ocr_correction_models"`)
    await queryRunner.query(
      `DROP TYPE "public"."post_ocr_correction_models_type_enum"`
    )
  }
}
