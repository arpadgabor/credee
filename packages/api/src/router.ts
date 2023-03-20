import { inferRouterInputs, inferRouterOutputs } from '@trpc/server'
import { router } from './core/trpc'
import { JobsRouter } from './modules/jobs/jobs.router'
import { RedditRouter } from './modules/jobs/reddit.router'
import { ParticipantsRouter } from './modules/participants/participants.router'
import { ResponsesRouter } from './modules/responses/responses.router'
import { SurveyRouter } from './modules/survey/survey.router'

export const appRouter = router({
  jobs: JobsRouter,
  surveys: SurveyRouter,
  responses: ResponsesRouter,
  participants: ParticipantsRouter,
  reddit: RedditRouter,
})
export type AppRouter = typeof appRouter
export type Outputs = inferRouterOutputs<AppRouter>
export type Inputs = inferRouterInputs<AppRouter>
