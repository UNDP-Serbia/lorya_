import { MigrationInterface, QueryRunner } from 'typeorm'

export class OcrResultsTable1773362622241 implements MigrationInterface {
  name = 'OcrResultsTable1773362622241'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "ocr_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lang" character varying NOT NULL, "script" character varying NOT NULL, "avgWordConfidence" double precision NOT NULL, "lines" jsonb NOT NULL, "segmentId" uuid NOT NULL, CONSTRAINT "UQ_7c0a4f991fe16665450419542ab" UNIQUE ("segmentId"), CONSTRAINT "REL_7c0a4f991fe16665450419542a" UNIQUE ("segmentId"), CONSTRAINT "PK_562c4e52268d72e5b1a6833beb5" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TYPE "public"."files_status_enum" RENAME TO "files_status_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."files_status_enum" AS ENUM('INITIALIZED', 'SEGMENTED', 'OCR_COMPLETED', 'COMPLETED')`
    )
    await queryRunner.query(
      `ALTER TABLE "files" ALTER COLUMN "status" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "files" ALTER COLUMN "status" TYPE "public"."files_status_enum" USING "status"::"text"::"public"."files_status_enum"`
    )
    await queryRunner.query(
      `ALTER TABLE "files" ALTER COLUMN "status" SET DEFAULT 'INITIALIZED'`
    )
    await queryRunner.query(`DROP TYPE "public"."files_status_enum_old"`)
    await queryRunner.query(
      `ALTER TABLE "ocr_results" ADD CONSTRAINT "FK_7c0a4f991fe16665450419542ab" FOREIGN KEY ("segmentId") REFERENCES "segments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "ocr_results" DROP CONSTRAINT "FK_7c0a4f991fe16665450419542ab"`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."files_status_enum_old" AS ENUM('INITIALIZED', 'SEGMENTED', 'COMPLETED')`
    )
    await queryRunner.query(
      `ALTER TABLE "files" ALTER COLUMN "status" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "files" ALTER COLUMN "status" TYPE "public"."files_status_enum_old" USING "status"::"text"::"public"."files_status_enum_old"`
    )
    await queryRunner.query(
      `ALTER TABLE "files" ALTER COLUMN "status" SET DEFAULT 'INITIALIZED'`
    )
    await queryRunner.query(`DROP TYPE "public"."files_status_enum"`)
    await queryRunner.query(
      `ALTER TYPE "public"."files_status_enum_old" RENAME TO "files_status_enum"`
    )
    await queryRunner.query(`DROP TABLE "ocr_results"`)
  }
}
