import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  FileStatus,
  type DownloadEntryDto,
  type FileManagerEntry,
  type SegmentResponse,
  type RenameEntryDto,
} from '../../api'
import { useLocation, useNavigate } from 'react-router'
import {
  ApplyButton,
  Button,
  IconButton,
  InputField,
  ModalDialog,
  ImageAnnotator,
  type SimpleAnnotation,
  type FolderOption,
  AutocompleteSelect,
} from '@shared/ui'
import {
  useCreateDirectory,
  useDeleteEntries,
  useMoveToEntries,
  useDownloadEntries,
  useRenameEntries,
} from '../../query'
import selectedItemsIcon from '../../assets/selected-items-icon.svg'
import closeIcon from '../../assets/close-icon.svg'
import toFileIcon from '../../assets/to-file.svg'
import downloadIcon from '../../assets/download-icon.svg'
import searchIcon from '../../assets/search-icon.svg'
import searchIconHover from '../../assets/search-icon-hover.svg'
import backIcon from '../../assets/back-icon.svg'
import addFolder from '../../assets/add-folder.svg'
import UploadImageComponent from './UploadImageComponent'
import SegmentedView from './SegmentedView'
import BrowserView from './BrowserView'
import toast from 'react-hot-toast'
import { extractFolderOptions } from '../../helpers'
import HoverIcon from '../helpers/HoverIcon'
import { useBatchSelection } from '../../context/BatchSelectionContext'

export const isImage = (name: string) =>
  /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(name)

export const buildStaticUrl = (relativePath: string) => {
  const base = String(import.meta.env.VITE_IMAGE_FETCH_URL || '')
  const normalized = relativePath.replace(/^\/+/, '')
  return `${base}/storage/${normalized}`
}

export const getCroppedSegmentUrl = (relativePath: string) => {
  const base = String(import.meta.env.VITE_IMAGE_FETCH_URL || '')
  return `${base}/${relativePath}`
}

type FileManagerProps = {
  entries?: FileManagerEntry[]
  entriesRoot?: FileManagerEntry[] //contains all folders from root; entries are filtered based on current path
  selectedPath?: string
  imageReloadKey?: number
  onImageDimensionsLoad?: (width: number, height: number) => void
  layoutAnnotations?: SimpleAnnotation[]
  onAnnotationSelect?: (annotation: SimpleAnnotation | null) => void
  onAnnotationCreate?: (annotation: SimpleAnnotation) => void
  onAnnotationUpdate?: (
    annotation: SimpleAnnotation,
    previous: SimpleAnnotation
  ) => void
  onAnnotationDelete?: (annotation: SimpleAnnotation) => void
  onLabelTypeChange?: (
    annotation: SimpleAnnotation,
    newLabelType: string
  ) => void
  croppedSegments?: SegmentResponse[]
  segmentsLoading?: boolean
  selectedSegmentId?: string | null
  onSelectSegment?: (segmentId: string | null) => void
  segmentCacheBustKey?: number
  onImageDoubleClick?: (entry: FileManagerEntry) => void
  onRevertSegment?: (segmentId: string) => void
  revertingSegmentId?: string | null
  onResetFile?: () => void
  isResettingFile?: boolean
  showResetButton?: boolean
}

const VIEW_MODES = {
  BROWSER: 'browser',
  EDITOR: 'editor',
  SEGMENT: 'segment',
}

type ViewMode = (typeof VIEW_MODES)[keyof typeof VIEW_MODES]

const clickDelay = 250 // ms
const gridStyle = 'grid gap-4 grid-cols-[repeat(auto-fill,minmax(200px,1fr))]'

export const FileManager: React.FC<FileManagerProps> = ({
  entries,
  entriesRoot,
  selectedPath,
  imageReloadKey = 0,
  onImageDimensionsLoad,
  layoutAnnotations = [],
  onAnnotationSelect,
  onAnnotationCreate,
  onAnnotationUpdate,
  onAnnotationDelete,
  onLabelTypeChange,
  croppedSegments = [],
  segmentsLoading = false,
  selectedSegmentId = null,
  onSelectSegment,
  segmentCacheBustKey = 0,
  onImageDoubleClick,
  onRevertSegment,
  revertingSegmentId = null,
  onResetFile,
  isResettingFile = false,
  showResetButton = false,
}) => {
  const navigate = useNavigate()
  const location = useLocation()

  const queryParams = new URLSearchParams(location.search)
  const imageParam = queryParams.get('image') || null
  const previewUrl = imageParam ? imageParam : null
  const displayImageUrl =
    previewUrl != null
      ? `${previewUrl.startsWith('http') ? previewUrl : buildStaticUrl(previewUrl)}?t=${imageReloadKey}`
      : null
  const fileName = previewUrl?.split('/').pop() || ''

  useEffect(() => {
    if (!onImageDimensionsLoad) return
    if (!displayImageUrl) {
      onImageDimensionsLoad(0, 0)
      return
    }
    const img = new Image()
    img.onload = () => {
      onImageDimensionsLoad(img.naturalWidth, img.naturalHeight)
    }
    img.src = displayImageUrl
    return () => {
      img.src = ''
    }
  }, [displayImageUrl, onImageDimensionsLoad])

  const [openCreateFolder, setOpenCreateFolder] = useState(false)
  const [newName, setNewName] = useState('')
  const [nameError, setNameError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState<string | null>(null)
  const [resetOpen, setResetOpen] = useState<boolean>(false)
  const [deleteOpen, setDeleteOpen] = useState<boolean>(false)
  const [moveToOpen, setMoveToOpen] = useState<boolean>(false)
  const [selectedFolder, setSelectedFolder] = useState<FolderOption | null>(
    null
  )
  const [newFolderName, setNewFolderName] = useState<string | number>('')
  const [folderToRename, setFolderToRename] = useState<FileManagerEntry | null>(
    null
  )

  const {
    mutateAsync: createDir,
    isPending: isCreating,
    error: createError,
  } = useCreateDirectory()
  const { mutateAsync: deleteEntries } = useDeleteEntries()
  const { mutateAsync: moveToEntries } = useMoveToEntries()
  const { mutateAsync: renameEntries } = useRenameEntries()

  const { selectedFiles, addFile } = useBatchSelection()

  const { mutate: downloadEntries, isPending: isDownloading } =
    useDownloadEntries({
      onError: () => {
        toast.error('Download failed')
      },
    })

  // Selection state: tracks which items are selected by full path
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const isSelected = (key: string) => selectedItems.has(key)
  const toggleSelect = (key: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const entriesMap = useMemo(() => {
    const map = new Map<string, FileManagerEntry>()

    entries?.forEach(item => {
      const fullPath = `${item.path}/${item.name}`
      map.set(fullPath, item)
    })

    return map
  }, [entries])

  const handleDelete = useCallback(() => {
    const payload = {
      entries: Array.from(selectedItems).map(path => {
        const item = entriesMap.get(path)
        return {
          type: item?.type || 'file',
          path: item?.path || '',
          name: item?.name || '',
        }
      }),
    }

    deleteEntries(payload).then(() => {
      toast.success('File deleted successfully')
      setDeleteOpen(false)
      setSelectedItems(new Set())
    })
  }, [selectedItems, deleteEntries, entriesMap])

  const handleMoveToFolder = useCallback(() => {
    const payload = {
      entries: Array.from(selectedItems).map(path => {
        const item = entriesMap.get(path)
        return {
          type: item?.type || 'file',
          path: item?.path || '',
          name: item?.name || '',
          newPath: selectedFolder?.value || '',
        }
      }),
    }

    moveToEntries(payload).then(() => {
      toast.success(`Items moved to ${selectedFolder?.label || 'folder'}`)
      setMoveToOpen(false)
      setSelectedFolder(null)
      setSelectedItems(new Set())
    })
  }, [selectedItems, selectedFolder, entriesMap, moveToEntries])

  const handleRenameFolder = useCallback(() => {
    const payload: RenameEntryDto = {
      entries: [
        {
          type: folderToRename?.type || 'directory',
          path: folderToRename?.path || '',
          name: folderToRename?.name || '',
          newName: (newFolderName as string) || '',
        },
      ],
    }

    renameEntries(payload).then(() => {
      toast.success('Folder renamed successfully')
      setFolderToRename(null)
      setNewFolderName('')
    })
  }, [folderToRename, newFolderName, renameEntries])

  const handleDownload = () => {
    if (!entries || selectedItems.size === 0) return

    const downloadPayload: DownloadEntryDto[] = []
    for (const selectedKey of selectedItems) {
      const entry = entries.find(e => {
        // Match the key format used by each component:
        // FolderCard (BrowserView line 63-64): path === '/' ? `/${name}` : `${path}/${name}`
        // ImageCard (line 31): `${path}/${name}` (produces `//name` at root)
        const fullPath =
          e.type === 'directory'
            ? e.path === '/'
              ? `/${e.name}`
              : `${e.path}/${e.name}`
            : `${e.path}/${e.name}`
        return fullPath === selectedKey
      })
      if (entry) {
        downloadPayload.push({
          type: entry.type,
          path: entry.path,
          name: entry.name,
        })
      }
    }

    if (downloadPayload.length > 0) {
      downloadEntries(downloadPayload)
    }
  }

  // Clear selection when path changes to avoid stale selections across folders
  useEffect(() => {
    setSelectedItems(new Set())
  }, [selectedPath])

  const handleCreateFolder = async () => {
    const trimmed = newName.trim()
    if (!trimmed) {
      setNameError('Name is required')
      return
    }
    if (/[\\/]/.test(trimmed)) {
      setNameError('Name cannot contain slashes')
      return
    }
    setNameError(null)
    try {
      await createDir({ path: selectedPath || '/', name: trimmed })
      setOpenCreateFolder(false)
      setNewName('')
    } catch (err) {
      console.error(err)
    }
  }

  const handleOpenDir = (dirPath: string) => {
    navigate({
      pathname: '/',
      search: dirPath ? `?path=${encodeURIComponent(dirPath)}` : '',
    })
  }

  const handleOpenImage = (imagePath: string) => {
    navigate({
      pathname: '/',
      search: `?path=${encodeURIComponent(selectedPath || '')}&image=${encodeURIComponent(imagePath)}`,
    })
  }

  const handleAnnotationsChange = useCallback(
    (annotations: SimpleAnnotation[]) => {
      console.log('All annotations:', annotations)
    },
    []
  )

  const clickTimeout = useRef<number | null>(null)

  const handleClick = (path: string) => {
    if (clickTimeout.current) clearTimeout(clickTimeout.current)

    clickTimeout.current = window.setTimeout(() => {
      toggleSelect(path)
      clickTimeout.current = null
    }, clickDelay)
  }

  const handleDoubleClick = (
    type: 'dir' | 'img',
    path: string,
    entry?: FileManagerEntry
  ) => {
    if (clickTimeout.current) {
      clearTimeout(clickTimeout.current)
      clickTimeout.current = null
    }
    if (type === 'dir') {
      handleOpenDir(path)
    } else {
      if (
        entry?.status === FileStatus.SEGMENTED ||
        entry?.status === FileStatus.OCR_COMPLETED ||
        entry?.status === FileStatus.COMPLETED
      ) {
        navigate({
          pathname: '/',
          search: `?path=${encodeURIComponent(selectedPath || '')}&image=${encodeURIComponent(path)}&view=segment`,
        })
      } else {
        handleOpenImage(path)
      }
      if (entry) onImageDoubleClick?.(entry)
    }
    setSelectedItems(new Set())
  }

  const normalizedSearch = (searchTerm ?? '').trim().toLowerCase()
  const filteredEntries = React.useMemo(() => {
    const list = entries ?? []
    if (!normalizedSearch) return list
    return list.filter(item =>
      item.name.toLowerCase().includes(normalizedSearch)
    )
  }, [entries, normalizedSearch])

  const viewParam = queryParams.get('view')
  const viewMode: ViewMode = React.useMemo(() => {
    if (
      viewParam === VIEW_MODES.BROWSER ||
      viewParam === VIEW_MODES.EDITOR ||
      viewParam === VIEW_MODES.SEGMENT
    ) {
      return viewParam
    }

    if (imageParam) return 'editor'

    return 'browser'
  }, [viewParam, imageParam])

  const renderContent = () => {
    switch (viewMode) {
      case VIEW_MODES.SEGMENT:
        if (segmentsLoading) return
        return (
          <SegmentedView
            segments={croppedSegments}
            selectedSegmentId={selectedSegmentId}
            onSelectSegment={onSelectSegment}
            cacheBustKey={segmentCacheBustKey}
            onRevertSegment={onRevertSegment}
            revertingSegmentId={revertingSegmentId}
          />
        )

      case VIEW_MODES.EDITOR:
        if (segmentsLoading) return
        return (
          <div className='h-full max-w-[1440px] m-auto mt-7'>
            <ImageAnnotator
              src={displayImageUrl || ''}
              alt='Preview'
              imageClassName='max-w-full w-full object-contain'
              containerClassName='annotorious-container'
              tool='rectangle'
              drawingEnabled={true}
              annotations={
                layoutAnnotations.length > 0 ? layoutAnnotations : undefined
              }
              showLabels={true}
              labelStyle={{ position: 'top', fontSize: 11 }}
              editable={true}
              // Zoom & Fullscreen
              zoomEnabled={true}
              fullscreenEnabled={true}
              toolbar={{
                show: true,
                position: 'top-right',
                showZoomIn: true,
                showZoomOut: true,
                showReset: true,
                showFullscreen: true,
                showZoomLevel: true,
                showPanToggle: true,
              }}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
              onAnnotationCreate={onAnnotationCreate}
              onAnnotationUpdate={onAnnotationUpdate}
              onAnnotationDelete={onAnnotationDelete}
              onLabelEdit={(annotation: SimpleAnnotation, newLabel: string) => {
                console.log('Label edited:', annotation, 'New label:', newLabel)
              }}
              onAnnotationSelect={onAnnotationSelect}
              onLabelTypeChange={onLabelTypeChange}
              onAnnotationsChange={handleAnnotationsChange}
              zoomInCustomIcon={<HoverIcon name='zoom-in-icon' />}
              zoomOutCustomIcon={<HoverIcon name='zoom-out-icon' />}
              resetCustomIcon={
                <HoverIcon name='rollback-icon' className='w-4' />
              }
              fullscreenCustomIcon={
                <HoverIcon name='resize-icon' className='w-3.5' />
              }
            />
          </div>
        )

      case VIEW_MODES.BROWSER:
      default:
        return (
          entries && (
            <BrowserView
              entries={entries}
              filteredEntries={filteredEntries}
              setFolderToRename={setFolderToRename}
              gridStyle={gridStyle}
              isSelected={isSelected}
              handleClick={handleClick}
              handleDoubleClick={handleDoubleClick}
              selectedPath={selectedPath}
              normalizedSearch={normalizedSearch}
              isImage={isImage}
              onClickCreateFolder={() => {
                setNewName('')
                setNameError(null)
                setOpenCreateFolder(true)
              }}
            />
          )
        )
    }
  }

  return (
    <div className='relative h-full w-full pt-6'>
      {displayImageUrl && (
        <div className='text-xs text-left text-gray-500 mb-10 mt-[-12px] flex items-center gap-2'>
          <Button
            onClick={() => {
              handleOpenImage('')
            }}
            noHover={true}
            className='bg-white text-[#292929] transition-colors flex gap-2 !ml-[-8px] !font-normal'
          >
            <img src={backIcon} alt='back icon' />
            <span className='font-normal hover:font-semibold'>Back</span>
          </Button>
          {showResetButton && (
            <ApplyButton
              label={isResettingFile ? 'Resetting\u2026' : 'Reset'}
              disabled={isResettingFile}
              onClick={() => setResetOpen(true)}
              sx={{
                borderColor: '#EF4444',
                color: '#991B1B',
                backgroundColor: '#FEE2E2',
                '&:hover': { backgroundColor: '#FECACA' },
              }}
            />
          )}
          <p className='pl-3 pt-0.5'>{fileName}</p>
        </div>
      )}

      {selectedItems.size > 0 ? (
        <div className='text-xs mb-[20px] pt-4 pb-[9px] border-b border-white flex items-center justify-start gap-3'>
          <IconButton
            onClick={() => setSelectedItems(new Set())}
            sx={{ width: 25, height: 25 }}
          >
            <img src={closeIcon} alt='close icon' />
          </IconButton>
          <div className='flex items-center gap-1 text-[#292929]'>
            <img
              width={'15px'}
              height={'15px'}
              src={selectedItemsIcon}
              alt='selected items icon'
            />
            <span className='w-17 truncate text-left'>
              {selectedItems.size} selected
            </span>
          </div>

          <IconButton
            onClick={() => setMoveToOpen(true)}
            sx={{ width: 25, height: 25 }}
          >
            <img src={toFileIcon} alt='move to file icon' />
          </IconButton>
          <IconButton
            onClick={handleDownload}
            disabled={isDownloading}
            sx={{ width: 25, height: 25 }}
          >
            <img src={downloadIcon} alt='download icon' />
          </IconButton>
          <IconButton
            onClick={() => setDeleteOpen(true)}
            sx={{ width: 25, height: 25 }}
          >
            <HoverIcon name='trash-can-icon' />
          </IconButton>
          <IconButton
            disableRipple
            disableFocusRipple
            onClick={() => {
              for (const path of selectedItems) {
                const entry = entriesMap.get(path)
                if (entry && entry.type === 'file') {
                  addFile(entry)
                }
              }
            }}
            disabled={
              selectedItems.size === 0 ||
              Array.from(selectedItems).every(path => {
                const entry = entriesMap.get(path)
                return (
                  !entry ||
                  entry.type !== 'file' ||
                  selectedFiles.some(f => f.fileId === entry.fileId)
                )
              })
            }
            className='flex items-center gap-1 !text-[11px] hover:bg-transparent'
          >
            <HoverIcon
              name='add-icon'
              width={'15px'}
              style={{ marginRight: '2px' }}
            />
            <span className='mt-0.5 text-[#292929]'>
              Add to active selection
            </span>
          </IconButton>
        </div>
      ) : (
        !displayImageUrl && (
          <div className='group'>
            <InputField
              name='search'
              placeholder=''
              variant='standard'
              sx={{ py: 2.5 }}
              borderColor={'#FFFFFF'}
              endIcon={
                <div className='relative w-4 h-4'>
                  {/* default */}
                  <img
                    src={searchIcon}
                    alt='search icon'
                    className='absolute inset-0 group-hover:hidden'
                  />

                  {/* hover */}
                  <img
                    src={searchIconHover}
                    alt='search icon hover'
                    className='absolute inset-0 hidden group-hover:block'
                  />
                </div>
              }
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        )
      )}

      {renderContent()}

      <ModalDialog
        open={openCreateFolder}
        title='Create folder'
        submitLabel='Create'
        cancelLabel='Cancel'
        loading={isCreating}
        onCancel={() => setOpenCreateFolder(false)}
        onSubmit={() => void handleCreateFolder()}
        error={nameError ?? (createError ? 'Action failed' : undefined)}
        hasCancelButton={false}
        titleIcon={<img src={addFolder} alt={'add folder icon'} />}
      >
        <div>
          <div className='mb-1 text-[13px] text-[#292929]'>Folder name</div>
          <InputField
            name='nameInput'
            value={newName}
            onChange={e => setNewName((e.target as HTMLInputElement).value)}
            placeholder='Periodika'
            autoFocus
            radius={8}
            borderColor={'#DFDFDF'}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '28px',
              },
            }}
            onKeyDown={e => {
              if (e.key === 'Enter') handleCreateFolder()
            }}
          />
        </div>
      </ModalDialog>

      {selectedPath !== '/' &&
        entries &&
        entries.length !== 0 &&
        viewMode === VIEW_MODES.BROWSER && (
          <UploadImageComponent
            selectedPath={selectedPath}
            additionalClass={'absolute bottom-1 right-[-10px] z-[100]'}
            noLabel={true}
          />
        )}

      <ModalDialog
        open={resetOpen}
        title={`Are you sure you want to reset your work on ${fileName || 'this file'}?`}
        submitLabel='Reset'
        cancelLabel='Cancel'
        onSubmit={onResetFile}
        onCancel={() => setResetOpen(false)}
      />

      <ModalDialog
        open={deleteOpen}
        title={`Are you sure you want to delete ${selectedItems.size} selected items?`}
        submitLabel='Delete'
        cancelLabel='Cancel'
        onSubmit={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />

      <ModalDialog
        open={moveToOpen}
        title={`Choose the folder where you wish to move selected items?`}
        submitLabel='Move'
        cancelLabel='Cancel'
        onSubmit={handleMoveToFolder}
        onCancel={() => {
          setMoveToOpen(false)
          setSelectedFolder(null)
        }}
        loading={!selectedFolder}
      >
        <div>
          <div className='mb-1 text-[13px] text-[#292929]'>Folder name</div>
          <AutocompleteSelect
            options={
              entriesRoot?.length ? extractFolderOptions(entriesRoot) : []
            }
            value={selectedFolder}
            onChange={setSelectedFolder}
          />
        </div>
      </ModalDialog>

      <ModalDialog
        open={!!folderToRename}
        title={`Type new file name?`}
        submitLabel='Update'
        cancelLabel='Cancel'
        onSubmit={handleRenameFolder}
        onCancel={() => {
          setFolderToRename(null)
          setNewFolderName('')
        }}
      >
        <div>
          <div className='mb-1 text-[13px] text-[#292929]'>Folder name</div>
          <InputField
            type='text'
            name='folderName'
            value={newFolderName || folderToRename?.name || ''}
            onChange={e =>
              setNewFolderName((e.target as HTMLInputElement).value)
            }
            autoFocus
            radius={8}
            borderColor={'#DFDFDF'}
            sx={{
              '& .MuiOutlinedInput-root': {
                height: '28px',
              },
            }}
          />
        </div>
      </ModalDialog>
    </div>
  )
}
