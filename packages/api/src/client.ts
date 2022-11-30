import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from './router.js';

export const ApiClient = (baseUrl: string) => createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${baseUrl ?? 'http://localhost:3000'}/trpc`,
    }),
  ],
});
