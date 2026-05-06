import { createBrowserRouter } from 'react-router'
import { HomePage, NotFoundPage, Settings } from '../pages'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '../pages'
import { prefetchAiModels } from '../query'
import { AppLayout } from './AppLayout'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        loader: () => prefetchAiModels(),
        element: (
          <ProtectedRoute>
            <HomePage />
          </ProtectedRoute>
        ),
      },
      {
        index: true,
        loader: () => console.log('settings'),
        path: 'settings/:model',
        element: (
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
