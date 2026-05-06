import { MigrationInterface, QueryRunner } from 'typeorm'

export class SegmentsTable1772150618675 implements MigrationInterface {
  name = 'SegmentsTable1772150618675'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."segments_labeltype_enum" AS ENUM('text', 'non-text')`
    )
    await queryRunner.query(
      `CREATE TABLE "segments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "label" character varying NOT NULL, "labelType" "public"."segments_labeltype_enum" NOT NULL, "boundingBox" jsonb NOT NULL, "originalPath" character varying NOT NULL, "modifiedPath" character varying NOT NULL, "order" integer NOT NULL, "fileId" uuid NOT NULL, CONSTRAINT "PK_beff1eec19679fe8ad4f291f04e" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `ALTER TABLE "segments" ADD CONSTRAINT "FK_a059bc634816872f3d5bdd96dd5" FOREIGN KEY ("fileId") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "segments" DROP CONSTRAINT "FK_a059bc634816872f3d5bdd96dd5"`
    )
    await queryRunner.query(`DROP TABLE "segments"`)
    await queryRunner.query(`DROP TYPE "public"."segments_labeltype_enum"`)
  }
}
