import { router } from './core/trpc.js'
import { JobsRouter } from './modules/jobs/jobs.router.js'

export const appRouter = router({
  jobs: JobsRouter,
})
export type AppRouter = typeof appRouter
