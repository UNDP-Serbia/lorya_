import React from 'react'
import { Tooltip } from '@shared/ui'
import HoverIcon from '../helpers/HoverIcon'

const getInitials = (name: string): string => {
  if (!name) return ''

  const words = name.trim().split(' ').filter(Boolean)
  if (words.length === 1) {
    return words[0][0].toUpperCase()
  }
  const first = words[0][0].toUpperCase()
  const last = words[words.length - 1][0].toUpperCase()

  return first + last
}

export type UserBadgeProps = {
  collapsed?: boolean
  name: string
  onToggle?: () => void
  className?: string
}

export const UserBadge: React.FC<UserBadgeProps> = ({
  collapsed = false,
  name,
  onToggle,
  className = '',
}) => {
  const initials = getInitials(name)

  const logout = () => {
    localStorage.removeItem('lryToken')
    localStorage.removeItem('lryRefreshToken')
    window.location.replace('/login')
  }

  return (
    <div
      className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-2 py-6.5`}
    >
      <div className={`flex items-center gap-1 ${className}`}>
        <div
          onClick={onToggle}
          className='w-10 ml-0.5 min-w-10 h-10 rounded-full bg-[#BCDDFF] text-[#292929] flex items-center justify-center text-sm font-semibold cursor-pointer select-none'
        >
          {initials}
        </div>

        {!collapsed && (
          <div className='text-sm font-semibold pl-2 text-[#292929]'>
            {name}
          </div>
        )}
      </div>
      {!collapsed && (
        <Tooltip title='Logout' placement='top' arrow>
          <button
            type='button'
            aria-label='More'
            className='p-1 rounded hover:bg-gray-100 !bg-white mr-[-10px]'
            onClick={logout}
          >
            <HoverIcon name='drawer-right-close-icon' />
          </button>
        </Tooltip>
      )}
    </div>
  )
}
