import { MigrationInterface, QueryRunner } from 'typeorm'

export class FileStatusColumn1773180030919 implements MigrationInterface {
  name = 'FileStatusColumn1773180030919'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."files_status_enum" AS ENUM('INITIALIZED', 'SEGMENTED', 'COMPLETED')`
    )
    await queryRunner.query(
      `ALTER TABLE "files" ADD "status" "public"."files_status_enum" NOT NULL DEFAULT 'INITIALIZED'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "status"`)
    await queryRunner.query(`DROP TYPE "public"."files_status_enum"`)
  }
}
