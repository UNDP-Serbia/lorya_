import { MigrationInterface, QueryRunner } from 'typeorm'

export class SegmentConfidenceColumn1773609107184
  implements MigrationInterface
{
  name = 'SegmentConfidenceColumn1773609107184'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "segments" ADD "confidence" double precision NOT NULL DEFAULT '1'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "segments" DROP COLUMN "confidence"`)
  }
}
