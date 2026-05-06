import { ModalDialog } from '@shared/ui'
import { type FC, useState } from 'react'
import { useUploadFiles } from '../../query'
import clsx from 'clsx'
import toast from 'react-hot-toast'
import { AxiosError } from 'axios'
import { getErrorMessage } from '../../helpers'
import HoverIcon from '../helpers/HoverIcon'

type UploadImageComponentProps = {
  selectedPath?: string
  additionalClass?: string
  noLabel?: boolean
}

const UploadImageComponent: FC<UploadImageComponentProps> = ({
  selectedPath = '/',
  additionalClass = '',
  noLabel = false,
}) => {
  const [dragActive, setDragActive] = useState(false)

  // Upload state and mutation
  const [filesToUpload, setFilesToUpload] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState<number[]>([])
  const { mutateAsync: uploadFiles, isPending: isUploading } = useUploadFiles()

  const handleFilesSelected = (list: FileList | null) => {
    const files = Array.from(list ?? [])
    setFilesToUpload(files)
    setUploadProgress(Array(files.length).fill(0))
  }

  const startUpload = async () => {
    if (!filesToUpload.length) return
    try {
      await uploadFiles(
        {
          path: selectedPath,
          files: filesToUpload,
          onProgress: (idx, pct) => {
            setUploadProgress(prev => {
              const next = [...prev]
              next[idx] = pct
              return next
            })
          },
        },
        {
          onError: (error: Error) => {
            const axiosError = error as AxiosError<any>
            const message = getErrorMessage(axiosError)

            toast.error(message)
            console.log(axiosError)
          },
        }
      )
      // reset selection after success
      setFilesToUpload([])
      setUploadProgress([])
    } catch (e) {
      console.error(e)
    }
  }

  return (
    <>
      <div
        className={clsx(
          'flex flex-col items-center justify-center space-x-2 text-gray-500 text-[13px] m-auto  rounded-xl transition-colors',
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300',
          additionalClass
        )}
        onDragOver={e => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(true)
        }}
        onDragLeave={e => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(false)
        }}
        onDrop={e => {
          e.preventDefault()
          e.stopPropagation()
          setDragActive(false)
          if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFilesSelected(e.dataTransfer.files)
            e.dataTransfer.clearData()
          }
        }}
      >
        <label
          htmlFor='file-upload'
          className='flex flex-col items-center justify-center cursor-pointer'
        >
          <div
            className={clsx(
              'w-[50px] h-[50px] bg-[#eaeaea] flex items-center justify-center rounded-full',
              noLabel && 'shadow-[0_0_0_2px_#ffffff]'
            )}
          >
            <HoverIcon name='add-icon' style={{ height: '30px' }} />
          </div>
          {!noLabel && (
            <span className='text-[#292929]'>
              Drop files here or browse files
            </span>
          )}
          <input
            id='file-upload'
            type='file'
            multiple
            hidden
            accept='image/*,application/pdf'
            onChange={e => handleFilesSelected(e.target.files)}
          />
        </label>
      </div>

      <ModalDialog
        open={filesToUpload.length > 0}
        title='Upload Files'
        submitLabel='Upload'
        cancelLabel='Cancel'
        loading={isUploading}
        onCancel={() => setFilesToUpload([])}
        onSubmit={() => void startUpload()}
        error={filesToUpload.length === 0}
      >
        {filesToUpload.length > 0 && (
          <div className='mb-4 space-y-2'>
            {filesToUpload.map((f, idx) => (
              <div key={`${f.name}-${idx}`}>
                <div className='flex items-center justify-between text-[11px] text-gray-600 mb-1'>
                  <span className='truncate pr-2'>{f.name}</span>
                  <span>{uploadProgress[idx] ?? 0}%</span>
                </div>
                <div className='h-2 bg-gray-200 rounded'>
                  <div
                    className='h-2 bg-blue-500 rounded'
                    style={{ width: `${uploadProgress[idx] ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </ModalDialog>
    </>
  )
}
export default UploadImageComponent
