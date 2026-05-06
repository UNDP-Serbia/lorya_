import { MigrationInterface, QueryRunner } from 'typeorm'

export class FileManagerTables1771277127408 implements MigrationInterface {
  name = 'FileManagerTables1771277127408'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "directories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "parentId" uuid, CONSTRAINT "UQ_4dd993c834fa856b3acc5eda5b8" UNIQUE ("name", "parentId"), CONSTRAINT "PK_d9318ce2673e948a761c266b63e" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_directories_name_root" ON "directories" ("name") WHERE "parentId" IS NULL`
    )
    await queryRunner.query(
      `CREATE TABLE "files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "name" character varying NOT NULL, "extension" character varying NOT NULL, "size" bigint NOT NULL, "mimeType" character varying NOT NULL, "relativePath" character varying NOT NULL, "directoryId" uuid, CONSTRAINT "UQ_243a47d093879608960fc57432b" UNIQUE ("name", "directoryId"), CONSTRAINT "PK_6c16b9093a142e0e7613b04a3d9" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_files_name_root" ON "files" ("name") WHERE "directoryId" IS NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "directories" ADD CONSTRAINT "FK_57be9650781d2a0c7c5dad6c67c" FOREIGN KEY ("parentId") REFERENCES "directories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "files" ADD CONSTRAINT "FK_b6c20a0ad410e90398cba624358" FOREIGN KEY ("directoryId") REFERENCES "directories"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "files" DROP CONSTRAINT "FK_b6c20a0ad410e90398cba624358"`
    )
    await queryRunner.query(
      `ALTER TABLE "directories" DROP CONSTRAINT "FK_57be9650781d2a0c7c5dad6c67c"`
    )
    await queryRunner.query(`DROP INDEX "public"."UQ_files_name_root"`)
    await queryRunner.query(`DROP TABLE "files"`)
    await queryRunner.query(`DROP INDEX "public"."UQ_directories_name_root"`)
    await queryRunner.query(`DROP TABLE "directories"`)
  }
}
