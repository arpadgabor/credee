import { AppRouter } from '@credee/api'
import { httpBatchLink, createTRPCProxyClient } from '@trpc/client'
import superjson from 'superjson'

const baseUrl = import.meta.env.API_URL

export const api = createTRPCProxyClient<AppRouter>({
  transformer: superjson,
  links: [
    httpBatchLink({
      url: `${baseUrl ?? 'http://127.0.0.1:3000'}/trpc`,
    }),
  ],
})
