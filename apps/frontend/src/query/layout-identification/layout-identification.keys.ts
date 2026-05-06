import { QueryClientKeys } from '../base.keys'

const ALL = [...QueryClientKeys.all, 'layout-identification']

export const LayoutIdentificationMutationKeys = {
  process: [...ALL, 'process'],
}
