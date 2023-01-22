import type { AppRouter } from '@credee/api'
import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import superjson from 'superjson'

const baseUrl = import.meta.env.VITE_API_URL

export const uploadsPath = (name: string) => `${baseUrl}/uploads/${name}`

export const api = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${baseUrl ?? '/api'}/trpc`,
    }),
  ],
})
