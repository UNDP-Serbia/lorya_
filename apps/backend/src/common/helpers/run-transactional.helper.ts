import { DataSource, QueryRunner } from 'typeorm'

export const runInTransaction = async <T>(
  dataSource: DataSource,
  callback: (queryRunner: QueryRunner) => Promise<T>
): Promise<T> => {
  const queryRunner: QueryRunner = dataSource.createQueryRunner()
  await queryRunner.connect()
  await queryRunner.startTransaction()

  try {
    const result: Awaited<T> = await callback(queryRunner)
    await queryRunner.commitTransaction()
    return result
  } catch (err) {
    await queryRunner.rollbackTransaction()
    throw err
  } finally {
    await queryRunner.release()
  }
}
