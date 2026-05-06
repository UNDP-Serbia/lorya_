import { useQuery } from '@tanstack/react-query'
import { type User, userEndpoints } from '../../api'
import { UserQueryKeys } from './user.keys'

export const useUserAccounts = () =>
  useQuery<User[], Error>({
    queryKey: UserQueryKeys.list(),
    queryFn: userEndpoints.getAll,
  })
