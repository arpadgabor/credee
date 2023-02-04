import { router } from './core/trpc.js'
import { JobsRouter } from './modules/jobs/jobs.router.js'
import { RedditRouter } from './modules/jobs/reddit.router.js'
import { ParticipantsRouter } from './modules/participants/participants.router.js'
import { ResponsesRouter } from './modules/responses/responses.router.js'
import { SurveyRouter } from './modules/survey/survey.router.js'

export const appRouter = router({
  jobs: JobsRouter,
  surveys: SurveyRouter,
  responses: ResponsesRouter,
  participants: ParticipantsRouter,
  reddit: RedditRouter,
})
export type AppRouter = typeof appRouter
