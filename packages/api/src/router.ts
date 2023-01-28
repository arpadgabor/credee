import { router } from './core/trpc.js'
import { SurveyRouter } from 'modules/survey/survey.router.js'
import { JobsRouter } from './modules/jobs/jobs.router.js'

export const appRouter = router({
  jobs: JobsRouter,
  surveys: SurveyRouter,
})
export type AppRouter = typeof appRouter
