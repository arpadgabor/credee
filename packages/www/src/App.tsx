import { useRoutes } from '@solidjs/router'
import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import type { Component } from 'solid-js'
import { Toaster } from 'solid-toast'
import { routes } from './router'

export const queryClient = new QueryClient()

const App: Component = () => {
  const Routes = useRoutes(routes)

  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position='top-center' toastOptions={{ duration: 5000 }} />
      <Routes />
    </QueryClientProvider>
  )
}

export default App
