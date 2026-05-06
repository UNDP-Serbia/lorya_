import { MigrationInterface, QueryRunner } from 'typeorm'

export class Accounts1759492999969 implements MigrationInterface {
  name = 'Accounts1759492999969'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."accounts_role_enum" AS ENUM('ADMIN')`
    )
    await queryRunner.query(
      `CREATE TABLE "accounts" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "firstName" character varying NOT NULL, "lastName" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."accounts_role_enum" NOT NULL DEFAULT 'ADMIN', CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY ("id"))`
    )
    await queryRunner.query(
      `CREATE TABLE "query-result-cache" ("id" SERIAL NOT NULL, "identifier" character varying, "time" bigint NOT NULL, "duration" integer NOT NULL, "query" text NOT NULL, "result" text NOT NULL, CONSTRAINT "PK_6a98f758d8bfd010e7e10ffd3d3" PRIMARY KEY ("id"))`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "query-result-cache"`)
    await queryRunner.query(`DROP TABLE "accounts"`)
    await queryRunner.query(`DROP TYPE "public"."accounts_role_enum"`)
  }
}
