import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSoftDeleteAndModelRunRefs1777895884944
  implements MigrationInterface
{
  name = 'AddSoftDeleteAndModelRunRefs1777895884944'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add modelRunId and deletedAt to segments
    await queryRunner.query(`ALTER TABLE "segments" ADD "modelRunId" uuid`)
    await queryRunner.query(`ALTER TABLE "segments" ADD "deletedAt" TIMESTAMP`)

    // Add modelRunId and deletedAt to post_ocr_correction_results
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_results" ADD "modelRunId" uuid`
    )
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_results" ADD "deletedAt" TIMESTAMP`
    )

    // Add modelRunId and deletedAt to ocr_results
    await queryRunner.query(`ALTER TABLE "ocr_results" ADD "modelRunId" uuid`)
    await queryRunner.query(
      `ALTER TABLE "ocr_results" ADD "deletedAt" TIMESTAMP`
    )

    // Drop old full unique constraints on segmentId (replaced by partial indexes below)
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_results" DROP CONSTRAINT IF EXISTS "UQ_997ce6fded9f4182b8087fea462"`
    )
    await queryRunner.query(
      `ALTER TABLE "ocr_results" DROP CONSTRAINT IF EXISTS "UQ_7c0a4f991fe16665450419542ab"`
    )

    // Create partial unique indexes (only for non-deleted rows)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_post_ocr_correction_results_segment_active" ON "post_ocr_correction_results" ("segmentId") WHERE "deletedAt" IS NULL`
    )
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_ocr_results_segment_active" ON "ocr_results" ("segmentId") WHERE "deletedAt" IS NULL`
    )

    // Add FK constraints to model_run
    await queryRunner.query(
      `ALTER TABLE "segments" ADD CONSTRAINT "FK_52d27408e55891d705abea91e29" FOREIGN KEY ("modelRunId") REFERENCES "model_run"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_results" ADD CONSTRAINT "FK_e55dd94a3f34e477f2c9d9482b5" FOREIGN KEY ("modelRunId") REFERENCES "model_run"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "ocr_results" ADD CONSTRAINT "FK_ae08b3244b4367ae7c0a03301a7" FOREIGN KEY ("modelRunId") REFERENCES "model_run"("id") ON DELETE SET NULL ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove FK constraints
    await queryRunner.query(
      `ALTER TABLE "ocr_results" DROP CONSTRAINT "FK_ae08b3244b4367ae7c0a03301a7"`
    )
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_results" DROP CONSTRAINT "FK_e55dd94a3f34e477f2c9d9482b5"`
    )
    await queryRunner.query(
      `ALTER TABLE "segments" DROP CONSTRAINT "FK_52d27408e55891d705abea91e29"`
    )

    // Drop partial unique indexes
    await queryRunner.query(
      `DROP INDEX "public"."UQ_ocr_results_segment_active"`
    )
    await queryRunner.query(
      `DROP INDEX "public"."UQ_post_ocr_correction_results_segment_active"`
    )

    // Restore old full unique constraints on segmentId
    await queryRunner.query(
      `ALTER TABLE "ocr_results" ADD CONSTRAINT "UQ_7c0a4f991fe16665450419542ab" UNIQUE ("segmentId")`
    )
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_results" ADD CONSTRAINT "UQ_997ce6fded9f4182b8087fea462" UNIQUE ("segmentId")`
    )

    // Remove added columns
    await queryRunner.query(`ALTER TABLE "ocr_results" DROP COLUMN "deletedAt"`)
    await queryRunner.query(
      `ALTER TABLE "ocr_results" DROP COLUMN "modelRunId"`
    )
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_results" DROP COLUMN "deletedAt"`
    )
    await queryRunner.query(
      `ALTER TABLE "post_ocr_correction_results" DROP COLUMN "modelRunId"`
    )
    await queryRunner.query(`ALTER TABLE "segments" DROP COLUMN "deletedAt"`)
    await queryRunner.query(`ALTER TABLE "segments" DROP COLUMN "modelRunId"`)
  }
}
