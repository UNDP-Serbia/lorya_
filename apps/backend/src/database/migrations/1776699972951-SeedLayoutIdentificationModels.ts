import { MigrationInterface, QueryRunner } from 'typeorm'

export class SeedLayoutIdentificationModels1776699972951
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "layout_identification_models" ("id", "name", "type", "reference")
      VALUES
        (gen_random_uuid(), 'Newspaper Navigator', 'BUILTIN', NULL),
        (gen_random_uuid(), 'YOLO v8', 'BUILTIN', 'app/layout/run_yolo.py'),
        (gen_random_uuid(), 'YOLO v9', 'BUILTIN', NULL)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM "layout_identification_models" WHERE "type" = 'BUILTIN'`
    )
  }
}
