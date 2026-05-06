export type ModelType = 'BUILTIN' | 'HUGGINGFACE'

export interface UploaderAccount {
  id: string
  firstName: string
  lastName: string
  fullName: string
  email: string
}

export interface AiModel {
  id: string
  name: string
  description: string | null
  type: ModelType
  reference: string | null
  configFilePath: string | null
  inputMapperFilePath: string | null
  outputMapperFilePath: string | null
  uploadedBy: UploaderAccount | null
  createdAt: string
  updatedAt: string
}

export interface CreateModelInput {
  name: string
  description?: string
  huggingfaceId: string
  configFile: File
  inputMapperFile: File
  outputMapperFile: File
}

export type UpdateModelInput = Partial<{
  name: string
  description: string
  huggingfaceId: string
  configFile: File
  inputMapperFile: File
  outputMapperFile: File
}>

export function toFormData(
  input: CreateModelInput | UpdateModelInput
): FormData {
  const fd = new FormData()
  if ('name' in input && input.name !== undefined) fd.append('name', input.name)
  if ('description' in input && input.description !== undefined)
    fd.append('description', input.description)
  if ('huggingfaceId' in input && input.huggingfaceId !== undefined)
    fd.append('huggingfaceId', input.huggingfaceId)
  if (input.configFile) fd.append('configFile', input.configFile)
  if (input.inputMapperFile) fd.append('inputMapperFile', input.inputMapperFile)
  if (input.outputMapperFile)
    fd.append('outputMapperFile', input.outputMapperFile)
  return fd
}
