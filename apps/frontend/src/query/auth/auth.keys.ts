import { QueryClientKeys } from '../base.keys'

export const AuthQueryKeys = {
  authenticated: [...QueryClientKeys.all, 'authenticated'],
  currentUser: [...QueryClientKeys.all, 'currentUser'],
}

export const AuthMutationKeys = {
  signIn: [...QueryClientKeys.all, 'signIn'],
  signUp: [...QueryClientKeys.all, 'signUp'],
}
