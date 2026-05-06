import { restClient } from '../../client'
import type { AiModel, CreateModelInput, UpdateModelInput } from './types'
import { toFormData } from './types'

const BASE = '/ai/models/post-ocr-corrections/models'

export const postOcrCorrectionModelsEndpoints = {
  list: (): Promise<AiModel[]> => restClient.get(BASE).then(r => r.data),
  get: (id: string): Promise<AiModel> =>
    restClient.get(`${BASE}/${id}`).then(r => r.data),
  create: (input: CreateModelInput): Promise<AiModel> =>
    restClient
      .post(BASE, toFormData(input), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data),
  update: (id: string, input: UpdateModelInput): Promise<AiModel> =>
    restClient
      .patch(`${BASE}/${id}`, toFormData(input), {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then(r => r.data),
  delete: (id: string): Promise<void> =>
    restClient.delete(`${BASE}/${id}`).then(() => undefined),
}
