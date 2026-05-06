import * as React from 'react'
import type { GridRenderCellParams, GridRowHeightParams } from '@shared/ui'
import { ApplyButton, IconButton, ModalDialog, MuiDataGrid } from '@shared/ui'
import imageEnhancementIcon from '../../assets/image-enhancement.svg'
import { useLocation, useNavigate, useParams } from 'react-router'
import { TableStyles } from './table-styles'
import HoverIcon from '../helpers/HoverIcon'
import { useModels, useDeleteModel } from '../../query/ai-models'
import { labelToCategory } from '../../utils/model-category'
import type { AiModel } from '../../api/interface/ai-models'

type Row = {
  id: string
  modelId: string
  modelName: string
  modelDescription: string
  type: 'BUILTIN' | 'HUGGINGFACE'
  uploadedBy: string
  lastUpdated: string
}

type Column = {
  field: keyof Row | 'actions'
  headerName: string
  minWidth?: number
  flex?: number
  sortable?: boolean
  filterable?: boolean
  align?: 'left' | 'right' | 'center'
  headerAlign?: 'left' | 'right' | 'center'
  cellClassName?: string
  renderCell?: (params: GridRenderCellParams<Row>) => React.ReactNode
}

function resolveUploadedBy(m: AiModel): string {
  if (m.type === 'BUILTIN') return 'System'
  return m.uploadedBy?.fullName ?? 'Deleted User'
}

function toRow(m: AiModel): Row {
  return {
    id: m.id,
    modelId: m.id.slice(0, 8),
    modelName: m.name,
    modelDescription: m.description ?? '',
    type: m.type,
    uploadedBy: resolveUploadedBy(m),
    lastUpdated: new Date(m.updatedAt).toLocaleString(),
  }
}

export const ModelTable: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { model } = useParams<{ model: string }>()
  const category = labelToCategory(model ? decodeURIComponent(model) : '')

  const fallbackCategory = category ?? 'image-enhancement'
  const { data: models = [], isLoading } = useModels(fallbackCategory)
  const deleteMutation = useDeleteModel(fallbackCategory)

  const rows = React.useMemo<Row[]>(
    () => (category ? models.map(toRow) : []),
    [category, models]
  )

  const [deleteOpen, setDeleteOpen] = React.useState(false)
  const [rowToDelete, setRowToDelete] = React.useState<Row | null>(null)

  const handleEdit = React.useCallback(
    (id: string) => {
      const params = new URLSearchParams(location.search)
      params.set('model_id', id)
      navigate({ pathname: location.pathname, search: params.toString() })
    },
    [location.pathname, location.search, navigate]
  )

  const handleAskDelete = React.useCallback((row: Row) => {
    setRowToDelete(row)
    setDeleteOpen(true)
  }, [])

  const handleConfirmDelete = React.useCallback(() => {
    if (rowToDelete) {
      deleteMutation.mutate(rowToDelete.id)
    }
    setDeleteOpen(false)
    setRowToDelete(null)
  }, [rowToDelete, deleteMutation])

  const handleCancelDelete = React.useCallback(() => {
    setDeleteOpen(false)
    setRowToDelete(null)
  }, [])

  const columns = React.useMemo(
    () => [
      { field: 'modelId', headerName: 'MODEL ID', minWidth: 80 },
      { field: 'modelName', headerName: 'MODEL NAME', minWidth: 140 },
      {
        field: 'modelDescription',
        headerName: 'MODEL DESCRIPTION',
        minWidth: 420,
        flex: 1,
        renderCell: (params: GridRenderCellParams<Row>) => (
          <div className='whitespace-pre-wrap'>{params.value}</div>
        ),
      },
      { field: 'uploadedBy', headerName: 'UPLOADED BY', minWidth: 180 },
      { field: 'lastUpdated', headerName: 'LAST UPDATED', minWidth: 120 },
      {
        field: 'actions',
        headerName: 'OPERATIONS',
        sortable: false,
        filterable: false,
        align: 'center',
        headerAlign: 'center',
        minWidth: 120,
        cellClassName: 'no-separator',
        renderCell: (params: GridRenderCellParams<Row>) => {
          if (params.row.type !== 'HUGGINGFACE') return null
          return (
            <div className='flex items-center gap-1.5 justify-center'>
              <IconButton
                size='small'
                sx={{ padding: '2px' }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  handleEdit(params.row.id)
                }}
              >
                <HoverIcon name='edit-icon' width={18} />
              </IconButton>
              <IconButton
                size='small'
                sx={{ padding: '2px' }}
                onClick={(e: React.MouseEvent) => {
                  e.stopPropagation()
                  handleAskDelete(params.row)
                }}
              >
                <HoverIcon name='trash-can-icon' width={18} />
              </IconButton>
            </div>
          )
        },
      },
    ],
    [handleEdit, handleAskDelete]
  )

  if (!category) {
    return <div>Unknown model category</div>
  }

  return (
    <div className='bg-transparent'>
      <div className='text-[12px] text-[#292929] py-6 mb-3 text-left'>
        {model}
      </div>
      <MuiDataGrid
        rows={rows}
        columns={columns as Column[]}
        loading={isLoading}
        disableColumnMenu
        hideFooter
        disableColumnSorting
        disableColumnResize
        disableRowSelectionOnClick
        getRowHeight={(params: GridRowHeightParams) => {
          const text: string = (params.model?.modelDescription as string) || ''
          const baseHeight = 44
          const lineHeight = 12
          const approxCharsPerLine = 60

          const lines = Math.max(
            1,
            Math.ceil(text?.length / approxCharsPerLine)
          )

          return baseHeight + (lines - 1) * lineHeight
        }}
        sx={TableStyles}
      />

      <div className='flex justify-end mt-3'>
        <ApplyButton
          onClick={() => {
            navigate(`${location.pathname}?model_id=null`)
          }}
          label={'ADD NEW MODEL'}
        />
      </div>

      <ModalDialog
        open={deleteOpen}
        title={`Delete ${rowToDelete?.modelName ?? ''}?`}
        submitLabel='Delete'
        cancelLabel='Cancel'
        onSubmit={handleConfirmDelete}
        onCancel={handleCancelDelete}
        titleIcon={
          <img src={imageEnhancementIcon} alt={'image enhancement icon'} />
        }
      ></ModalDialog>
    </div>
  )
}
