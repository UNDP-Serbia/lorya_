import React from 'react'
import { Outlet, useNavigation } from 'react-router'
import { Loading } from '@shared/ui'

export const AppLayout: React.FC = () => {
  const navigation = useNavigation()
  const isLoading = navigation.state === 'loading'

  if (isLoading) {
    return (
      <div
        className='w-screen h-screen flex items-center justify-center'
        aria-busy
      >
        <Loading />
      </div>
    )
  }

  return <Outlet />
}
