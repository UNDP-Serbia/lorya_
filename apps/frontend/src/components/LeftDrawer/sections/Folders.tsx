import type { FileManagerEntry } from '../../../api'
import React, { useEffect } from 'react'
import clsx from 'clsx'
import folderOpen from '../../../assets/folder-open-icon.svg'
import folderClosed from '../../../assets/folder-closed-icon.svg'
import arrowRightIcon from '../../../assets/arrow-right-icon.svg'
import arrowDownIcon from '../../../assets/arrow-down-icon.svg'
import { useNavigate, useSearchParams } from 'react-router'

type FoldersProps = {
  entries?: FileManagerEntry[]
}
const buttonStyles =
  'flex w-full items-center gap-1 px-2 py-1.5 h-7 !bg-white !border-l-[3px] border-l-transparent hover:!bg-[linear-gradient(90deg,_#E7F3FF_0%,_#FFFFFF_74.52%)] hover:!border-l-[#BCDDFF] !border-r-0'

export const Folders: React.FC<FoldersProps> = ({ entries }) => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const selectedPath = searchParams.get('path') || ''

  const [openMap, setOpenMap] = React.useState<Record<string, boolean>>({})

  const toggleNode = React.useCallback((id: string) => {
    setOpenMap(prev => ({ ...prev, [id]: !prev[id] }))
  }, [])

  // Auto-open folders along the selected path so icons reflect open state after navigation
  useEffect(() => {
    if (!selectedPath) return
    const parts = selectedPath.split('/').filter(Boolean)
    let acc = ''
    const toOpen: Record<string, boolean> = {}
    for (const part of parts) {
      acc += `/${part}`
      toOpen[acc] = true
    }
    setOpenMap(prev => ({ ...prev, ...toOpen }))
  }, [selectedPath])

  const renderNode = React.useCallback(
    (entry: FileManagerEntry, level: number = 0): React.ReactNode => {
      const nodePath =
        entry.path === '/' ? `/${entry.name}` : `${entry.path}/${entry.name}`
      const id = nodePath
      const isDirectory = entry.type === 'directory'

      if (!isDirectory) return null

      const children =
        Array.isArray(entry.children) && entry.children.length > 0
          ? entry.children.filter(child => child.type === 'directory')
          : []

      const hasChildren = children.length > 0
      const isOpen = openMap[id] ?? false
      const isSelected = nodePath === selectedPath

      const handleClick = () => {
        if (isSelected) {
          toggleNode(id)
          return
        }

        navigate({
          pathname: '/',
          search: nodePath ? `?path=${encodeURIComponent(nodePath)}` : '',
        })

        if (hasChildren) toggleNode(id)
      }

      return (
        <div key={id} className='w-full bg-white hover:border-0'>
          <button
            type='button'
            onClick={handleClick}
            className={clsx(
              buttonStyles,
              'group',
              isSelected &&
                '!bg-[linear-gradient(90deg,_#E7F3FF_0%,_#FFFFFF_74.52%)] !border-l-[#BCDDFF] border-r-0',
              !hasChildren && 'py-1'
            )}
            style={{
              paddingLeft: `${level * 7}px`,
              outline: 'none',
              borderRadius: '0px 10px 10px 0px',
            }}
          >
            {hasChildren ? (
              <span className='inline-block w-4 select-none text-gray-500 mb-1'>
                {isOpen ? (
                  <img
                    src={arrowDownIcon}
                    alt='arrow down'
                    className='ml-1 mt-1'
                  />
                ) : (
                  <img
                    src={arrowRightIcon}
                    alt='arrow right'
                    className='ml-2 mt-1'
                  />
                )}
              </span>
            ) : (
              <span className='inline-block w-4' />
            )}
            <span className='relative inline-flex w-4 items-center justify-center'>
              <img
                src={folderClosed}
                alt='folder closed'
                className={clsx(
                  'absolute',
                  isOpen ? 'hidden' : 'block group-hover:hidden'
                )}
              />

              <img
                src={folderOpen}
                alt='folder open'
                className={clsx(
                  'absolute',
                  isOpen ? 'block' : 'hidden group-hover:block'
                )}
              />
            </span>
            <span className='text-[11px] text-[#292929] font-normal truncate max-w-[120px]'>
              {entry.name}
            </span>
          </button>

          {hasChildren && isOpen && (
            <div className='ml-3'>
              {children.map(child => renderNode(child, level + 1))}
            </div>
          )}
        </div>
      )
    },
    [openMap, toggleNode, navigate, selectedPath]
  )

  return <>{(entries ?? []).map(entry => renderNode(entry)) || null}</>
}
