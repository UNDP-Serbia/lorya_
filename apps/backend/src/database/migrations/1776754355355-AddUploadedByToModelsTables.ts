import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddUploadedByToModelsTables1776754355355
  implements MigrationInterface
{
  name = 'AddUploadedByToModelsTables1776754355355'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_models" ADD "uploadedById" uuid`
    )
    await queryRunner.query(`ALTER TABLE "ocr_models" ADD "uploadedById" uuid`)
    await queryRunner.query(
      `ALTER TABLE "layout_identification_models" ADD "uploadedById" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "image_enhancement_models" ADD "uploadedById" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_models" ADD CONSTRAINT "FK_2988c60fa61d08ed5cc4486efc5" FOREIGN KEY ("uploadedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ocr_models" ADD CONSTRAINT "FK_13bf270a5ee970dd6c083cf77ed" FOREIGN KEY ("uploadedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "layout_identification_models" ADD CONSTRAINT "FK_a98ae2f8bc086483a10f067381e" FOREIGN KEY ("uploadedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "image_enhancement_models" ADD CONSTRAINT "FK_bb270bfaaed1f2ce545653943b5" FOREIGN KEY ("uploadedById") REFERENCES "accounts"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "image_enhancement_models" DROP CONSTRAINT "FK_bb270bfaaed1f2ce545653943b5"`
    )
    await queryRunner.query(
      `ALTER TABLE "layout_identification_models" DROP CONSTRAINT "FK_a98ae2f8bc086483a10f067381e"`
    )
    await queryRunner.query(
      `ALTER TABLE "ocr_models" DROP CONSTRAINT "FK_13bf270a5ee970dd6c083cf77ed"`
    )
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_models" DROP CONSTRAINT "FK_2988c60fa61d08ed5cc4486efc5"`
    )
    await queryRunner.query(
      `ALTER TABLE "image_enhancement_models" DROP COLUMN "uploadedById"`
    )
    await queryRunner.query(
      `ALTER TABLE "layout_identification_models" DROP COLUMN "uploadedById"`
    )
    await queryRunner.query(
      `ALTER TABLE "ocr_models" DROP COLUMN "uploadedById"`
    )
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_models" DROP COLUMN "uploadedById"`
    )
  }
}
