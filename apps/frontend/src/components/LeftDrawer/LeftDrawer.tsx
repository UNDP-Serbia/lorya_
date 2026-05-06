import React from 'react'
import {
  IconButton,
  Tooltip,
  ChevronRightOutlinedIcon,
  CustomDrawer,
  CustomAccordion,
} from '@shared/ui'
import logoPath from '../../assets/logo-with-text.svg'
import mobileLogoPath from '../../assets/logo.svg'
import openModelIcon from '../../assets/open-model-icon.svg'
import openHistoryIcon from '../../assets/open-history-icon.svg'
import openFolderIcon from '../../assets/open-folder-icon.svg'
import { type FileManagerEntry } from '../../api'
import { Folders, History, Models } from './sections'
import { useLocation, useNavigate } from 'react-router'
import HoverIcon from '../helpers/HoverIcon'

export type LeftDrawerProps = {
  width?: number
  collapsed?: boolean
  onToggle?: (collapsed: boolean) => void
  entries?: FileManagerEntry[]
  isEditor?: boolean
  selectedFileId?: string | null
}

export const LeftDrawer: React.FC<LeftDrawerProps> = ({
  width,
  collapsed: collapsedProp,
  onToggle,
  entries,
  isEditor,
  selectedFileId,
}) => {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false)
  const isCollapsed = collapsedProp ?? internalCollapsed
  const navigate = useNavigate()
  const location = useLocation()
  const isSettings = location.pathname.includes('/settings')

  const handleToggle = React.useCallback(() => {
    if (onToggle) onToggle(!isCollapsed)
    else setInternalCollapsed(prev => !prev)
  }, [isCollapsed, onToggle])

  return (
    <CustomDrawer collapsed={isCollapsed} width={width} anchor='left'>
      <div
        className={`flex items-center gap-2 px-2 py-2 ${
          isCollapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!isCollapsed && (
          <div
            className='flex w-full p-2 h-[75px] ml-[-4px]'
            onClick={() => void navigate('/')}
          >
            {logoPath ? (
              <img
                src={logoPath}
                alt='logo'
                className='w-[120px] cursor-pointer'
              />
            ) : (
              <span className='text-sm font-semibold'>Logo</span>
            )}
          </div>
        )}
        <IconButton
          onClick={handleToggle}
          aria-label={isCollapsed ? 'Open drawer' : 'Collapse drawer'}
          size='small'
          className='!bg-white'
        >
          {isCollapsed ? (
            <div className='py-4'>
              {mobileLogoPath ? (
                <img
                  src={mobileLogoPath}
                  alt='logo'
                  className='w-[39px] mt-[-3px]'
                />
              ) : (
                <ChevronRightOutlinedIcon fontSize='small' />
              )}
            </div>
          ) : (
            <HoverIcon name='drawer-colapse' width={'20px'} />
          )}
        </IconButton>
      </div>

      <div className='border-t-[0.5px] border-[#BCDDFF]' />

      {isCollapsed ? (
        <div className='flex flex-col items-center gap-2 py-2'>
          <Tooltip title='Folders' placement='right'>
            <IconButton size='small' sx={{ mt: 0.5 }}>
              <img src={openFolderIcon} alt='open folder' />
            </IconButton>
          </Tooltip>
          <div className='my-1 h-[0.5px] w-full bg-[#BCDDFF]' />
          <Tooltip title='Model' placement='right'>
            <IconButton size='small'>
              <img src={openModelIcon} alt='open model' />
            </IconButton>
          </Tooltip>
          <div className='my-1 h-[0.5px] w-full bg-[#BCDDFF]' />
          {isEditor && (
            <>
              <Tooltip title='History' placement='right'>
                <IconButton size='small'>
                  <img src={openHistoryIcon} alt='open history' />
                </IconButton>
              </Tooltip>
              <div className='my-1 h-[0.5px] w-full bg-[#BCDDFF]' />
            </>
          )}
        </div>
      ) : (
        <div className='px-0'>
          <CustomAccordion text={'Folder'} defaultExpanded={!isSettings}>
            <Folders entries={entries} />
          </CustomAccordion>
          <CustomAccordion text={'Model'} defaultExpanded={isSettings}>
            <Models />
          </CustomAccordion>
          {isEditor && (
            <CustomAccordion text={'History'}>
              <History fileId={selectedFileId ?? null} />
            </CustomAccordion>
          )}
        </div>
      )}
    </CustomDrawer>
  )
}
