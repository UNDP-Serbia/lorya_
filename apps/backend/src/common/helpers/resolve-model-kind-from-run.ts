import { DataSource } from 'typeorm'
import { ModelRunEntity } from 'src/model-run/model-run.entity'

type ModelWithType = { type: string }

export async function resolveModelKindFromRun(
  dataSource: DataSource,
  modelRepository: { findById(id: string): Promise<ModelWithType | null> },
  modelRunId: string | null | undefined
): Promise<string | null> {
  if (!modelRunId) return null
  const run = await dataSource.getRepository(ModelRunEntity).findOne({
    where: { id: modelRunId },
  })
  if (!run) return null
  const model = await modelRepository.findById(run.modelId)
  return model?.type ?? null
}
