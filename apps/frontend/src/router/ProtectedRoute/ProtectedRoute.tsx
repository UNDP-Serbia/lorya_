import React from 'react'
import { AuthMutationKeys, useAuthenticated } from '../../query'
import { Navigate } from 'react-router'
import { useIsMutating } from '@tanstack/react-query'

type Props = React.PropsWithChildren

export const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { data: isAuthenticated, isLoading, isSuccess } = useAuthenticated()
  const isSigningIn =
    useIsMutating({ mutationKey: AuthMutationKeys.signIn }) > 0

  if (isLoading || isSigningIn || !isSuccess) return

  if (!isAuthenticated) return <Navigate to='/login' replace />

  return <>{children}</>
}
