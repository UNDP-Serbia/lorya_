import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddOcrModelsTable1776700330369 implements MigrationInterface {
  name = 'AddOcrModelsTable1776700330369'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."ocr_models_type_enum" AS ENUM('BUILTIN', 'HUGGINGFACE')`
    )
    await queryRunner.query(
      `CREATE TABLE "ocr_models" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "description" text, "type" "public"."ocr_models_type_enum" NOT NULL, "reference" character varying(512), "configFilePath" character varying(512), "inputMapperFilePath" character varying(512), "outputMapperFilePath" character varying(512), CONSTRAINT "PK_45d16cca8a73b8deb42a4e9e3b0" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_b5eeb9127fe13725d0e11977de" ON "ocr_models" ("name") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b5eeb9127fe13725d0e11977de"`
    )
    await queryRunner.query(`DROP TABLE "ocr_models"`)
    await queryRunner.query(`DROP TYPE "public"."ocr_models_type_enum"`)
  }
}
