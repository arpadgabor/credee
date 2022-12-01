import { router } from './core/trpc.js'
import { TasksRouter } from './modules/tasks/tasks.router.js'

export const appRouter = router({
  tasks: TasksRouter,
})

export type AppRouter = typeof appRouter
