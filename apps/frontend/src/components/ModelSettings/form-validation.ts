import * as Yup from 'yup'

export type SchemaParams = {
  isOcrModel?: boolean
  activeSection?: 'model' | 'tesseract'
  isEditing?: boolean
}

const hasExtension = (exts: string[]) => (value: unknown) => {
  if (value === null || value === undefined) return true
  if (!(value instanceof File)) return false
  const name = value.name.toLowerCase()
  return exts.some(ext => name.endsWith(ext))
}

const baseCommon = {
  name: Yup.string().required('Model name is required'),
  description: Yup.string().required('Description is required'),
}

const configExtensionTest = {
  name: 'config-ext',
  message: 'Config file must be a .json file',
  test: hasExtension(['.json']),
}

const mapperExtensionTest = {
  name: 'mapper-ext',
  message: 'Mapper file must be a .py file',
  test: hasExtension(['.py']),
}

const modelOnly = (isEditing: boolean) => ({
  source: Yup.string().oneOf(['upload', 'fetch', 'huggingface']).required(),
  localUpload: Yup.mixed().nullable(),
  fetchUrl: Yup.string().notRequired(),
  hfUrl: Yup.string().when('source', {
    is: 'huggingface',
    then: schema => schema.required('HuggingFace model id is required'),
    otherwise: schema => schema.notRequired(),
  }),
  configFile: (isEditing
    ? Yup.mixed().nullable()
    : Yup.mixed().required('config.json is required')
  ).test(configExtensionTest),
  inputMapperFile: (isEditing
    ? Yup.mixed().nullable()
    : Yup.mixed().required('input_mapper.py is required')
  ).test(mapperExtensionTest),
  outputMapperFile: (isEditing
    ? Yup.mixed().nullable()
    : Yup.mixed().required('output_mapper.py is required')
  ).test(mapperExtensionTest),
})

const tesseractOnly = {
  executable: Yup.string().required('Executable is required'),
  languageData: Yup.string().required('Language data is required'),
  tesseractLangCode: Yup.string().required('Lang code is required'),
  tesseractConfig: Yup.mixed().required('tesseract config is required'),
}

export const getModelSettingsSchema = ({
  isOcrModel,
  activeSection,
  isEditing = false,
}: SchemaParams) => {
  if (!isOcrModel) {
    return Yup.object({
      ...baseCommon,
      ...modelOnly(isEditing),
    })
  }
  if (activeSection === 'tesseract') {
    return Yup.object({
      ...baseCommon,
      source: Yup.string().notRequired(),
      localUpload: Yup.mixed().nullable(),
      fetchUrl: Yup.string().notRequired(),
      hfUrl: Yup.string().notRequired(),
      configFile: Yup.mixed().notRequired(),
      inputMapperFile: Yup.mixed().notRequired(),
      outputMapperFile: Yup.mixed().notRequired(),
      ...tesseractOnly,
    })
  }
  return Yup.object({
    ...baseCommon,
    ...modelOnly(isEditing),
    executable: Yup.string().notRequired(),
    languageData: Yup.string().notRequired(),
    tesseractLangCode: Yup.string().notRequired(),
    tesseractConfig: Yup.mixed().notRequired(),
  })
}

export const modelSettingsSchema = Yup.object({
  ...baseCommon,
  ...modelOnly(false),
})
