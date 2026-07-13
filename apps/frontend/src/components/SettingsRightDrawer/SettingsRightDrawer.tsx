import React from 'react'
import { CustomDrawer, CustomAccordion, Tooltip, IconButton } from '@shared/ui'
import { UserBadge } from '../shared'
import documnetsIcon from '../../assets/documents-icon.svg'
import settingsIcon from '../../assets/settings-icon.svg'
import languageIcon from '../../assets/language-icon.svg'

export type SettingsRightDrawerProps = {
  width?: number
  collapsed?: boolean
  onToggle?: (collapsed: boolean) => void
}

export const SettingsRightDrawer: React.FC<SettingsRightDrawerProps> = ({
  width,
  collapsed: collapsedProp,
  onToggle,
}) => {
  const [internalCollapsed, setInternalCollapsed] = React.useState(false)

  const isCollapsed = collapsedProp ?? internalCollapsed

  const handleToggle = React.useCallback(() => {
    if (onToggle) onToggle(!isCollapsed)
    else setInternalCollapsed(prev => !prev)
  }, [isCollapsed, onToggle])

  return (
    <CustomDrawer anchor='right' collapsed={isCollapsed} width={width}>
      <UserBadge collapsed={internalCollapsed} onToggle={handleToggle} />

      <hr className='border-t-[0.5px] border-[#BCDDFF]' />

      {isCollapsed ? (
        <div className='flex flex-col items-center gap-2 py-2'>
          <Tooltip title='Documents' placement='right'>
            <IconButton size='small' sx={{ mt: 0.5 }}>
              <img src={documnetsIcon} alt='documnets icon' />
            </IconButton>
          </Tooltip>
          <div className='my-1 h-[0.5px] w-full bg-[#BCDDFF]' />
          <Tooltip title='Settings' placement='right'>
            <IconButton size='small'>
              <img src={settingsIcon} alt='settings icon' />
            </IconButton>
          </Tooltip>
          <div className='my-1 h-[0.5px] w-full bg-[#BCDDFF]' />
          <Tooltip title='Language' placement='right'>
            <IconButton size='small'>
              <img src={languageIcon} alt='language icon' className='w-5' />
            </IconButton>
          </Tooltip>
          <div className='my-1 h-[0.5px] w-full bg-[#BCDDFF]' />
        </div>
      ) : (
        <div>
          <CustomAccordion text='Documents'>
            <div className='p-4 text-sm text-gray-600'>Documents content</div>
          </CustomAccordion>

          <CustomAccordion text='Settings'>
            <div className='p-4 text-sm text-gray-600'>Settings content</div>
          </CustomAccordion>

          <CustomAccordion text='Language'>
            <div className='p-4 text-sm text-gray-600'>Language content</div>
          </CustomAccordion>
        </div>
      )}
    </CustomDrawer>
  )
}
