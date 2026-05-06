import { MigrationInterface, QueryRunner } from 'typeorm'

export class SeedOcrModels1776700363399 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "ocr_models" ("id", "name", "type", "reference")
      VALUES
        (gen_random_uuid(), 'Tesseract SRP', 'BUILTIN', 'app/ocr/run_tesseract.py'),
        (gen_random_uuid(), 'Tesseract SRP_latn', 'BUILTIN', NULL),
        (gen_random_uuid(), 'Tesseract ENG', 'BUILTIN', NULL)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM "ocr_models" WHERE "type" = 'BUILTIN'`)
  }
}
