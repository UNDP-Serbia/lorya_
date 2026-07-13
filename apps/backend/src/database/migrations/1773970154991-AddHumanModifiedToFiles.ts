import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddHumanModifiedToFiles1773970154991 implements MigrationInterface {
  name = 'AddHumanModifiedToFiles1773970154991'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "files" ADD "humanModified" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."segments_type_enum" AS ENUM('GENERATED', 'MANUAL')`
    )
    await queryRunner.query(
      `ALTER TABLE "segments" ADD "type" "public"."segments_type_enum" NOT NULL DEFAULT 'GENERATED'`
    )
    await queryRunner.query(
      `ALTER TABLE "segments" ADD "humanModified" boolean NOT NULL DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "segments" DROP COLUMN "humanModified"`
    )
    await queryRunner.query(`ALTER TABLE "segments" DROP COLUMN "type"`)
    await queryRunner.query(`DROP TYPE "public"."segments_type_enum"`)
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "humanModified"`)
  }
}
