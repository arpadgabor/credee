import { router } from './core/trpc.js'
import { SurveyRouter } from 'modules/survey/survey.router.js'
import { JobsRouter } from './modules/jobs/jobs.router.js'
import { ResponsesRouter } from 'modules/responses/responses.router.js'
import { ParticipantsRouter } from 'modules/participants/participants.router.js'

export const appRouter = router({
  jobs: JobsRouter,
  surveys: SurveyRouter,
  responses: ResponsesRouter,
  participants: ParticipantsRouter,
})
export type AppRouter = typeof appRouter
