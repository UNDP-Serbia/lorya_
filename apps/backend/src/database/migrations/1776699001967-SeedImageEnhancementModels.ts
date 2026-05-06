import { MigrationInterface, QueryRunner } from 'typeorm'

export class SeedImageEnhancementModels1776699001967
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "image_enhancement_models" ("id", "name", "type", "reference")
      VALUES
        (gen_random_uuid(), 'Binarization', 'BUILTIN', NULL),
        (gen_random_uuid(), 'Adaptive Thresholding', 'BUILTIN', '/app/image_enhancement/adaptive_thresholding.py'),
        (gen_random_uuid(), 'Otsu Thresholding', 'BUILTIN', NULL),
        (gen_random_uuid(), 'Sauvola Thresholding', 'BUILTIN', NULL),
        (gen_random_uuid(), 'Restormer', 'BUILTIN', NULL)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "image_enhancement_models" WHERE "type" = 'BUILTIN'`
    )
  }
}
