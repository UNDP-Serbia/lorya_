import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddLayoutIdentificationModelsTable1776699686029 implements MigrationInterface {
  name = 'AddLayoutIdentificationModelsTable1776699686029'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."layout_identification_models_type_enum" AS ENUM('BUILTIN', 'HUGGINGFACE')`
    )
    await queryRunner.query(
      `CREATE TABLE "layout_identification_models" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying(255) NOT NULL, "description" text, "type" "public"."layout_identification_models_type_enum" NOT NULL, "reference" character varying(512), "configFilePath" character varying(512), "inputMapperFilePath" character varying(512), "outputMapperFilePath" character varying(512), CONSTRAINT "PK_fc8d9ed7769aa5b5e8dabe95613" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_957cfee863d81bee06633beedd" ON "layout_identification_models" ("name") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_957cfee863d81bee06633beedd"`
    )
    await queryRunner.query(`DROP TABLE "layout_identification_models"`)
    await queryRunner.query(
      `DROP TYPE "public"."layout_identification_models_type_enum"`
    )
  }
}
