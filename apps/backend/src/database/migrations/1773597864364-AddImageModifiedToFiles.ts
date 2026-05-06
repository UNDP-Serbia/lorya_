import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddImageModifiedToFiles1773597864364
  implements MigrationInterface
{
  name = 'AddImageModifiedToFiles1773597864364'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "files" ADD "imageModified" boolean NOT NULL DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "files" DROP COLUMN "imageModified"`)
  }
}
