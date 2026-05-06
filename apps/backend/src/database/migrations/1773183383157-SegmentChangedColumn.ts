import { MigrationInterface, QueryRunner } from 'typeorm'

export class SegmentChangedColumn1773183383157 implements MigrationInterface {
  name = 'SegmentChangedColumn1773183383157'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "segments" ADD "changed" boolean NOT NULL DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "segments" DROP COLUMN "changed"`)
  }
}
