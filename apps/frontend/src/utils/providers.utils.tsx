import React from 'react'

type Providers = [React.ComponentType<any>, any?][]

export const combineProviders = (
  providers: Providers
): React.FC<React.PropsWithChildren> =>
  providers.reduce(
    (AccumulatedProviders, [Provider, props = {}]) =>
      ({ children }) => (
        <AccumulatedProviders>
          <Provider {...props}>
            <>{children}</>
          </Provider>
        </AccumulatedProviders>
      ),
    ({ children }) => <>{children}</>
  )
