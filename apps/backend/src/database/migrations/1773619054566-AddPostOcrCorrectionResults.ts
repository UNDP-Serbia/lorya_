import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPostOcrCorrectionResults1773619054566 implements MigrationInterface {
  name = 'AddPostOcrCorrectionResults1773619054566'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "post_ocr_correction_results" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "lang" character varying NOT NULL, "script" character varying NOT NULL, "avgWordConfidence" double precision NOT NULL, "cer" double precision, "wer" double precision, "lines" jsonb NOT NULL, "segmentId" uuid NOT NULL, CONSTRAINT "UQ_997ce6fded9f4182b8087fea462" UNIQUE ("segmentId"), CONSTRAINT "REL_997ce6fded9f4182b8087fea46" UNIQUE ("segmentId"), CONSTRAINT "PK_14048fc66f0a3bb09b6ebc09abf" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TYPE "public"."files_status_enum" RENAME TO "files_status_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."files_status_enum" AS ENUM('INITIALIZED', 'SEGMENTED', 'OCR_COMPLETED', 'POST_OCR_COMPLETED', 'COMPLETED')`
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
      `ALTER TABLE "post_ocr_correction_results" ADD CONSTRAINT "FK_997ce6fded9f4182b8087fea462" FOREIGN KEY ("segmentId") REFERENCES "segments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_results" DROP CONSTRAINT "FK_997ce6fded9f4182b8087fea462"`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."files_status_enum_old" AS ENUM('INITIALIZED', 'SEGMENTED', 'OCR_COMPLETED', 'COMPLETED')`
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
    await queryRunner.query(`DROP TABLE "post_ocr_correction_results"`)
  }
}
