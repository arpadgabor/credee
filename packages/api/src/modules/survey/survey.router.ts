import { createListSchema } from 'core/zod.js'
import { z } from 'zod'
import { procedure, router } from '../../core/trpc.js'
import { countSurveys, createSurvey, listSurveys } from './survey.service.js'

const surveyCreate = z.object({
  title: z.string(),
  endsAt: z.date(),
})

const surveySchema = surveyCreate.and(
  z.object({
    id: z.number(),
  })
)

const list = procedure.output(createListSchema(surveySchema)).query(async () => {
  const surveys = await listSurveys()

  const dto = surveys.map(s => ({
    id: s.id,
    title: s.title,
    endsAt: s.ends_at,
  }))

  return {
    data: dto ?? [],
    meta: {
      count: await countSurveys(),
    },
  }
})

const create = procedure
  .input(surveyCreate)
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
  })

export const SurveyRouter = router({
  create,
  list,
})
