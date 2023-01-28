import { z } from 'zod'
import { procedure, router } from '../../core/trpc.js'
import { countSurveys, createSurvey, listSurveys } from './survey.service.js'

const surveySchema = z.object({
  id: z.number(),
  title: z.string(),
  endsAt: z.date(),
})

export const SurveyRouter = router({
  create: procedure
    .input(
      z.object({
        title: z.string(),
        endsAt: z.date(),
      })
    )
    .output(surveySchema)
    .mutation(async ({ input }) => {
      const survey = await createSurvey({
        title: input.title,
        ends_at: input.endsAt,
      })

      return {
        id: survey.id,
        title: survey.title,
        endsAt: survey.ends_at,
      }
    }),

  list: procedure
    .output(
      z.object({
        results: z.array(surveySchema),
        meta: z.object({
          count: z.number(),
        }),
      })
    )
    .query(async () => {
      const surveys = await listSurveys()

      const dto = surveys.map(s => ({
        id: s.id,
        title: s.title,
        endsAt: s.ends_at,
      }))

      return {
        results: dto,
        meta: {
          count: await countSurveys(),
        },
      }
    }),
})
