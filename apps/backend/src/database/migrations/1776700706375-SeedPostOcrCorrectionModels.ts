import { MigrationInterface, QueryRunner } from 'typeorm'

export class SeedPostOcrCorrectionModels1776700706375
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "post_ocr_correction_models" ("id", "name", "type", "reference")
      VALUES
        (gen_random_uuid(), 'SR_post-OCR_v1', 'BUILTIN', 'app/post_ocr/run_postocr.py'),
        (gen_random_uuid(), 'SR_post-OCR_v2', 'BUILTIN', NULL),
        (gen_random_uuid(), 'SR_post-OCR_v2_an1', 'BUILTIN', NULL)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "post_ocr_correction_models" WHERE "type" = 'BUILTIN'`
    )
  }
}
