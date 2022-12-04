import { useRoutes } from '@solidjs/router'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import type { Component } from 'solid-js'
import { routes } from './router'

export const queryClient = new QueryClient()

const App: Component = () => {
  const Routes = useRoutes(routes)

  return (
    <QueryClientProvider client={queryClient}>
      <Routes />
    </QueryClientProvider>
  )
}

export default App
