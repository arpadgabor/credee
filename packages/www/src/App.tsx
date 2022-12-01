import { QueryClient, QueryClientProvider } from '@tanstack/solid-query'
import type { Component } from 'solid-js'

import { Home } from './pages/home'

export const queryClient = new QueryClient()

const App: Component = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <Home />
    </QueryClientProvider>
  )
}

export default App
