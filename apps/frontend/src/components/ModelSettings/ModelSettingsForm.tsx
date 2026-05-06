import React from 'react'
import {
  SimpleInput,
  ModalDialog,
  ApplyButton,
  FileUploadButton,
} from '@shared/ui'
import { FormikProvider, useFormik } from 'formik'
import { getModelSettingsSchema } from './form-validation'
import { FormErrorMessage } from '../shared'
import { FileBadge } from './FileBadge'
import clsx from 'clsx'
import checkRounded from '../../assets/check-rounded-icon.svg'
import testModelIcon from '../../assets/test-model-icon.svg'
import * as Yup from 'yup'
import { useSearchParams } from 'react-router'
import { useCreateModel, useUpdateModel, useModel } from '../../query/ai-models'
import type { ModelCategory } from '../../utils/model-category'

const FieldLabel: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span className='block bg-[#eaeaea] text-[#7B7B7B] px-1 absolute !z-10 text-[11px] top-[-8px] left-3.5'>
    {children}
  </span>
)

const ModelSettingsFormInputStyles = {
  position: 'relative',
  '& .MuiOutlinedInput-input': {
    marginBottom: -1,
    height: 35,
    fontSize: 15,
    paddingLeft: '6px',
  },
  '& .MuiInputLabel-shrink': {
    marginTop: '0',
  },
  '& .MuiInputLabel-root': {
    fontSize: 11,
    color: '#7B7B7B',
    marginTop: '3.5px',
    padding: '0px 5px !important',
  },
  '& .MuiOutlinedInput-root': {
    border: '1px solid rgba(123, 123, 123, 0.3)',
    background: '#eaeaea',
  },
  '& .MuiFormLabel-root': {
    background: '#eaeaea',
    padding: '0 10px',
  },
}
const ModelSettingsFormInputLinksStyles = {
  ...ModelSettingsFormInputStyles,
  '& .MuiOutlinedInput-input': {
    fontSize: 11,
    mb: -1,
    height: 20,
    pl: 0.5,
  },
}

const ocrLabelStyle = 'w-75 text-left pl-5'

const SourceOptions = {
  LOCAL_UPLOAD: 'upload',
  FETCH_PARAMS: 'fetch',
  HUGGINGFACE: 'huggingface',
} as const

type MMProps = {
  modelId?: string
  category: ModelCategory
  isOcrModel?: boolean
}

type InitialValuesType = {
  name: string
  description: string
  source: (typeof SourceOptions)[keyof typeof SourceOptions]
  localUpload: File | null
  fetchUrl: string
  hfUrl: string
  configFile: File | null
  inputMapperFile: File | null
  outputMapperFile: File | null
  executable: string
  languageData: string
  tesseractLangCode: string
  tesseractConfig: File | null
}

const fileNameFromPath = (p: string | null | undefined) =>
  p ? (p.split('/').pop() ?? '') : ''

export const ModelSettingsForm: React.FC<MMProps> = ({
  modelId,
  category,
  isOcrModel,
}) => {
  const [, setSearchParams] = useSearchParams()
  const [isLoading, setIsLoading] = React.useState(false)
  const [uploadProgress, setUploadProgress] = React.useState<number>(0)
  const timerRef = React.useRef<number | null>(null)

  const isEditing = Boolean(modelId)

  const [activeSection, setActiveSection] = React.useState<
    'model' | 'tesseract'
  >('model')

  const { data: existing } = useModel(category, isEditing ? modelId : undefined)
  const createMutation = useCreateModel(category)
  const updateMutation = useUpdateModel(category)

  const formik = useFormik<InitialValuesType>({
    initialValues: {
      name: existing?.name ?? '',
      description: existing?.description ?? '',
      source: SourceOptions.HUGGINGFACE,
      localUpload: null,
      fetchUrl: '',
      hfUrl: existing?.reference ?? '',
      configFile: null,
      inputMapperFile: null,
      outputMapperFile: null,
      executable: '',
      languageData: '',
      tesseractLangCode: '',
      tesseractConfig: null,
    },
    validate: values => {
      const schema = getModelSettingsSchema({
        isOcrModel,
        activeSection,
        isEditing,
      })

      try {
        schema.validateSync(values, { abortEarly: false })
        return {}
      } catch (err: unknown) {
        const errors: Record<string, string> = {}
        if (err instanceof Yup.ValidationError) {
          if (Array.isArray(err.inner)) {
            err.inner.forEach(e => {
              if (e.path && !errors[e.path]) {
                errors[e.path] = e.message
              }
            })
          } else if (err.path) {
            errors[err.path] = err.message
          }
        }
        return errors
      }
    },
    enableReinitialize: true,

    onSubmit: async values => {
      if (isOcrModel && activeSection === 'tesseract') {
        return
      }

      const baseInput = {
        name: values.name,
        description: values.description || undefined,
        huggingfaceId: values.hfUrl,
      }

      try {
        if (isEditing && modelId) {
          const input = {
            ...baseInput,
            ...(values.configFile ? { configFile: values.configFile } : {}),
            ...(values.inputMapperFile
              ? { inputMapperFile: values.inputMapperFile }
              : {}),
            ...(values.outputMapperFile
              ? { outputMapperFile: values.outputMapperFile }
              : {}),
          }
          await updateMutation.mutateAsync({ id: modelId, input })
        } else {
          if (
            !values.configFile ||
            !values.inputMapperFile ||
            !values.outputMapperFile
          ) {
            return
          }
          await createMutation.mutateAsync({
            ...baseInput,
            configFile: values.configFile,
            inputMapperFile: values.inputMapperFile,
            outputMapperFile: values.outputMapperFile,
          })
        }

        setSearchParams(prev => {
          const params = new URLSearchParams(prev)
          params.delete('model_id')
          return params
        })
      } catch (err) {
        console.error('Model save failed', err)
      }
    },
  })

  const startLoading = React.useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    setIsLoading(true)
    setUploadProgress(0)
    timerRef.current = window.setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          if (timerRef.current) {
            window.clearInterval(timerRef.current)
            timerRef.current = null
          }
          setIsLoading(false)
          return 100
        }
        return prev + 5
      })
    }, 200)
  }, [])

  const cancelLoading = React.useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
    setIsLoading(false)
    setUploadProgress(0)
  }, [])

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current)
      }
    }
  }, [])

  const handleFieldChange = React.useCallback(
    (fieldName: string, value: string | number | null | File) => {
      void formik.setFieldValue(fieldName, value)
    },
    [formik]
  )

  const existingConfigName = fileNameFromPath(existing?.configFilePath)
  const existingInputMapperName = fileNameFromPath(
    existing?.inputMapperFilePath
  )
  const existingOutputMapperName = fileNameFromPath(
    existing?.outputMapperFilePath
  )

  return (
    <FormikProvider value={formik}>
      <form
        className='flex flex-col gap-5 text-[12px] text-[#292929]'
        onSubmit={formik.handleSubmit}
        encType='multipart/form-data'
      >
        <div className='relative'>
          <FieldLabel>Model name</FieldLabel>
          <SimpleInput
            type='text'
            sx={ModelSettingsFormInputStyles}
            value={formik.values.name}
            onChange={v => handleFieldChange('name', v)}
          />
          <FormErrorMessage name='name' className='mt-5 !mb-[-24px]' />
        </div>

        <div className='relative mt-3'>
          <FieldLabel>Model description</FieldLabel>
          <textarea
            className='w-full bg-[#eaeaea] text-[13px] text-[#292929] rounded p-2 pl-3 outline-none min-h-[96px] border border-[rgba(123,123,123,0.3)]'
            value={formik.values.description}
            onChange={v => handleFieldChange('description', v.target.value)}
          />
          <FormErrorMessage name='description' />
        </div>

        {isOcrModel && (
          <>
            <div className='flex items-center justify-start'>
              <button
                type='button'
                onClick={() => setActiveSection('tesseract')}
                className='mb-[-12px] !p-0'
                aria-pressed={activeSection === 'tesseract'}
                title='Activate Tesseract Configuration'
              >
                {activeSection === 'tesseract' ? (
                  <img
                    src={checkRounded}
                    alt='check'
                    height={16}
                    width={16}
                    className='mb-[5px]'
                  />
                ) : (
                  <span
                    className={
                      'inline-block w-4 h-4 border rounded-xl border-[#1976D2]'
                    }
                  />
                )}
              </button>
            </div>

            <div className='relative'>
              <FieldLabel>Tesseract</FieldLabel>
              <div
                className={clsx(
                  'rounded p-2 pt-3 outline-none border border-[rgba(123,123,123,0.3)] grid grid-cols-2 gap-2',
                  activeSection !== 'tesseract' &&
                    'opacity-60 pointer-events-none'
                )}
              >
                <div className='flex items-center gap-2'>
                  <span className={ocrLabelStyle}>Executable</span>
                  <div className='w-full'>
                    <SimpleInput
                      type='text'
                      sx={ModelSettingsFormInputLinksStyles}
                      value={formik.values.executable}
                      onChange={v => handleFieldChange('executable', v)}
                    />
                    <FormErrorMessage
                      name='executable'
                      className='mt-1 mb-[-8px]'
                    />
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className={clsx(ocrLabelStyle, '!pl-2 !w-32')}>
                    Language data
                  </span>
                  <div className='w-full'>
                    <SimpleInput
                      type='text'
                      sx={ModelSettingsFormInputLinksStyles}
                      value={formik.values.languageData}
                      onChange={v => handleFieldChange('languageData', v)}
                    />
                    <FormErrorMessage
                      name='languageData'
                      className='mt-1 mb-[-8px]'
                    />
                  </div>
                </div>
                <div className='flex items-center gap-2'>
                  <span className={ocrLabelStyle}>Tesseract Lang code</span>
                  <div className='w-full'>
                    <SimpleInput
                      type='text'
                      sx={ModelSettingsFormInputLinksStyles}
                      value={formik.values.tesseractLangCode}
                      onChange={v => handleFieldChange('tesseractLangCode', v)}
                    />
                    <FormErrorMessage
                      name='tesseractLangCode'
                      className='mt-1 mb-[-8px]'
                    />
                  </div>
                </div>

                <FileBadge
                  label={
                    formik.values.tesseractConfig?.name || 'Upload config file'
                  }
                  onFileSelect={file =>
                    handleFieldChange('tesseractConfig', file)
                  }
                  error={
                    formik.errors.tesseractConfig && formik.submitCount > 0
                      ? formik.errors.tesseractConfig
                      : undefined
                  }
                  value={formik.values.tesseractConfig}
                />
              </div>
            </div>
          </>
        )}

        {isOcrModel && (
          <div className='flex items-center justify-start'>
            <button
              type='button'
              onClick={() => setActiveSection('model')}
              className='!p-0 mb-[-12px]'
              aria-pressed={activeSection === 'model'}
              title='Activate Model Parameters'
            >
              {activeSection === 'model' ? (
                <img
                  src={checkRounded}
                  alt='check'
                  height={16}
                  width={16}
                  className='mb-[5px]'
                />
              ) : (
                <span
                  className={
                    'inline-block w-4 h-4 border rounded-xl border-[#1976D2]'
                  }
                />
              )}
            </button>
          </div>
        )}
        <div className='relative'>
          <div className='flex items-center justify-between pr-1'>
            <FieldLabel>Model parameters</FieldLabel>
          </div>
          <div
            className={clsx(
              'rounded p-2 pt-3 outline-none border border-[rgba(123,123,123,0.3)]',
              isOcrModel &&
                activeSection !== 'model' &&
                'opacity-60 pointer-events-none'
            )}
          >
            <div className='flex flex-col gap-2'>
              <div
                className='flex items-center gap-2 justify-start mb-[-4px]'
                title='Coming soon'
              >
                <label className='flex items-center gap-2 w-60.5 opacity-50'>
                  <input
                    type='radio'
                    disabled
                    checked={
                      formik.values.source === SourceOptions.LOCAL_UPLOAD
                    }
                    onChange={() => {}}
                  />
                  <span>Upload local file</span>
                </label>
                <div className='w-full'>
                  <FileUploadButton
                    sx={{ width: '100%' }}
                    accept='image/*'
                    disabled
                    label={formik.values.localUpload?.name || 'Upload file'}
                    onFileSelect={file =>
                      handleFieldChange('localUpload', file)
                    }
                  />
                </div>
              </div>

              <div className='flex items-center gap-2' title='Coming soon'>
                <label className='flex items-center gap-2 w-60 opacity-50'>
                  <input
                    type='radio'
                    disabled
                    checked={
                      formik.values.source === SourceOptions.FETCH_PARAMS
                    }
                    onChange={() => {}}
                  />
                  <span>Fetch params</span>
                </label>
                <div className='w-full'>
                  <SimpleInput
                    disabled
                    type='text'
                    sx={ModelSettingsFormInputLinksStyles}
                    value={formik.values.fetchUrl}
                    onChange={v => handleFieldChange('fetchUrl', v)}
                  />
                </div>
              </div>

              <div className='flex items-center gap-2'>
                <label className='flex items-center gap-2 w-60'>
                  <input
                    type='radio'
                    checked={formik.values.source === SourceOptions.HUGGINGFACE}
                    onChange={() => {
                      formik.setFieldValue('source', SourceOptions.HUGGINGFACE)
                      formik.setFieldValue('localUpload', null)
                      formik.setFieldValue('fetchUrl', '')
                    }}
                  />
                  <span>Load from huggingface</span>
                </label>
                <div className='w-full'>
                  <SimpleInput
                    disabled={
                      formik.values.source !== SourceOptions.HUGGINGFACE
                    }
                    type='text'
                    sx={ModelSettingsFormInputLinksStyles}
                    value={formik.values.hfUrl}
                    onChange={v => handleFieldChange('hfUrl', v)}
                  />
                  <FormErrorMessage name='hfUrl' className='mt-1 mb-[-8px]' />
                </div>
              </div>
            </div>

            <div className='flex items-center justify-start'>
              <div className='flex items-center w-59.5'></div>
              <div className='flex gap-0 mt-2 pt-4 w-full'>
                <div className='flex flex-col'>
                  <FileBadge
                    label={
                      formik.values.configFile?.name ||
                      existingConfigName ||
                      'Upload config file'
                    }
                    accept='.json,application/json'
                    onFileSelect={file => handleFieldChange('configFile', file)}
                    error={
                      formik.errors.configFile && formik.submitCount > 0
                        ? formik.errors.configFile
                        : undefined
                    }
                    value={formik.values.configFile}
                  />
                  {isEditing &&
                    existingConfigName &&
                    !formik.values.configFile && (
                      <span className='text-[10px] text-[#7B7B7B] mt-1'>
                        Current: {existingConfigName}
                      </span>
                    )}
                </div>
                <div className='flex flex-col'>
                  <FileBadge
                    label={
                      formik.values.inputMapperFile?.name ||
                      existingInputMapperName ||
                      'Upload input mapper file'
                    }
                    accept='.py,text/x-python'
                    onFileSelect={file =>
                      handleFieldChange('inputMapperFile', file)
                    }
                    error={
                      formik.errors.inputMapperFile && formik.submitCount > 0
                        ? formik.errors.inputMapperFile
                        : undefined
                    }
                    value={formik.values.inputMapperFile}
                  />
                  {isEditing &&
                    existingInputMapperName &&
                    !formik.values.inputMapperFile && (
                      <span className='text-[10px] text-[#7B7B7B] mt-1'>
                        Current: {existingInputMapperName}
                      </span>
                    )}
                </div>
                <div className='flex flex-col'>
                  <FileBadge
                    label={
                      formik.values.outputMapperFile?.name ||
                      existingOutputMapperName ||
                      'Upload output mapper file'
                    }
                    accept='.py,text/x-python'
                    onFileSelect={file =>
                      handleFieldChange('outputMapperFile', file)
                    }
                    error={
                      formik.errors.outputMapperFile && formik.submitCount > 0
                        ? formik.errors.outputMapperFile
                        : undefined
                    }
                    value={formik.values.outputMapperFile}
                  />
                  {isEditing &&
                    existingOutputMapperName &&
                    !formik.values.outputMapperFile && (
                      <span className='text-[10px] text-[#7B7B7B] mt-1'>
                        Current: {existingOutputMapperName}
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>

          <div className='flex gap-2 mt-4 justify-end'>
            <ApplyButton label={'Test model'} onClick={startLoading} />
            <ApplyButton
              label={isEditing ? 'Save' : 'Confirm'}
              type='submit'
              onClick={formik.handleSubmit}
            />
          </div>

          <ModalDialog
            open={isLoading}
            title='Model Testing in Progress'
            submitLabel='Close'
            cancelLabel='Cancel'
            hasCancelButton={false}
            hasX={false}
            onCancel={cancelLoading}
            titleIcon={<img src={testModelIcon} alt='test model' />}
          >
            <div className='w-full max-w-full'>
              <div className='h-8 flex items-center gap-3'>
                <div className='flex-1 h-2 bg-[#F0E0D8] rounded'>
                  <div
                    className='h-2 bg-[#F59E0B] rounded'
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className='text-[11px] border border-[#FFA963] rounded p-1 w-9 text-center'>
                  {uploadProgress}%
                </span>
                <ApplyButton
                  label={'Cancel'}
                  type='button'
                  onClick={cancelLoading}
                  status='running'
                />
              </div>
              <div className='text-[11px] text-gray-500 mt-1'>
                512 KB / 2.4 MB
              </div>
            </div>
          </ModalDialog>
        </div>
      </form>
    </FormikProvider>
  )
}
