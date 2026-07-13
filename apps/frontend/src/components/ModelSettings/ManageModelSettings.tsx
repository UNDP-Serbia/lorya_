import { useNavigate, useParams } from 'react-router'
import backIcon from '../../assets/back-icon.svg'
import { Button } from '@shared/ui'
import { ModelSettingsForm } from './ModelSettingsForm'
import { labelToCategory } from '../../utils/model-category'

type IProps = {
  modelId: string
}
const OCR_LABEL = 'Optical Character Recognition'
const POST_OCR_LABEL = 'Post-OCR Correction'

export const ManageModelSettings: React.FC<IProps> = ({ modelId }) => {
  const navigate = useNavigate()
  const { model } = useParams<{ model: string }>()
  const decodedLabel = model ? decodeURIComponent(model) : ''
  const category = labelToCategory(decodedLabel)

  if (!category) {
    return <div>Unknown model category</div>
  }

  const editingId = modelId && modelId !== 'null' ? modelId : undefined

  return (
    <div className='flex flex-col gap-3'>
      <div className='text-xs text-left text-gray-500 mb-3.5 mt-[14px]'>
        <Button
          onClick={() => void navigate(-1)}
          className='bg-white text-[#292929] transition-colors flex gap-2 !ml-[-8px]'
          noHover={true}
        >
          <img src={backIcon} alt='back icon' />
          <span className='font-normal hover:font-semibold'>Back</span>
        </Button>
      </div>

      <ModelSettingsForm
        modelId={editingId}
        category={category}
        showTesseractSection={decodedLabel === OCR_LABEL}
        showCustomLlmSection={
          decodedLabel === OCR_LABEL || decodedLabel === POST_OCR_LABEL
        }
      />
    </div>
  )
}
