import { Button } from '@shared/ui'
import React, { useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router'

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    navigate('/404', { replace: true })
  }, [navigate])

  const goHome = useCallback(() => {
    navigate('/')
  }, [navigate])

  return (
    <div className='flex flex-col items-center justify-center'>
      <h1 className='text-center'>404</h1>
      <p className='text-center'>The page you are looking for is not found!</p>
      <Button onClick={goHome}>Back to Home</Button>
    </div>
  )
}
