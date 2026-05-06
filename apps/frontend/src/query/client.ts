import { QueryClient } from '@tanstack/react-query'
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

export const persister = createAsyncStoragePersister({
  storage: window.localStorage,
})
