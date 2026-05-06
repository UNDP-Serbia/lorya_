import { QueryClientKeys } from '../base.keys'

export const AuthQueryKeys = {
  authenticated: [...QueryClientKeys.all, 'authenticated'],
}

export const AuthMutationKeys = {
  signIn: [...QueryClientKeys.all, 'signIn'],
  signUp: [...QueryClientKeys.all, 'signUp'],
}
