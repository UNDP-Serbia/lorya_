import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import { UIProvider } from '@shared/ui'
import { combineProviders } from './utils'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { queryClient, persister } from './query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { RouterProvider } from 'react-router'
import { router } from './router'
import { Toaster } from 'react-hot-toast'
import { GlobalNetworkLoader } from './components'

const Providers = combineProviders([
  [StrictMode],
  [UIProvider],
  [
    PersistQueryClientProvider,
    { client: queryClient, persistOptions: { persister } },
  ],
])

createRoot(document.getElementById('root')!).render(
  <Providers>
    <RouterProvider router={router} />
    <GlobalNetworkLoader />
    <Toaster position='top-center' />
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
  </Providers>
)
