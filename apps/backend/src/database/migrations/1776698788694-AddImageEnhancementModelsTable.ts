import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddImageEnhancementModelsTable1776698788694 implements MigrationInterface {
  name = 'AddImageEnhancementModelsTable1776698788694'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."image_enhancement_models_type_enum" AS ENUM('BUILTIN', 'HUGGINGFACE')`
    )
    await queryRunner.query(
      `CREATE TABLE "image_enhancement_models" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "description" text, "type" "public"."image_enhancement_models_type_enum" NOT NULL, "reference" character varying(512), "configFilePath" character varying(512), "inputMapperFilePath" character varying(512), "outputMapperFilePath" character varying(512), CONSTRAINT "PK_f407102921bd90f66675813ff26" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_468fda95f42020eca2721640cc" ON "image_enhancement_models" ("name") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_468fda95f42020eca2721640cc"`
    )
    await queryRunner.query(`DROP TABLE "image_enhancement_models"`)
    await queryRunner.query(
      `DROP TYPE "public"."image_enhancement_models_type_enum"`
    )
  }
}
