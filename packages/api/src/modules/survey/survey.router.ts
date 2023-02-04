import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { procedure, router } from '../../core/trpc.js'
import { createListSchema as listOf } from '../../core/zod.js'
import { countSurveys, createSurvey, findSurvey, listSurveys } from './survey.service.js'

const surveyCreate = z.object({
  title: z.string(),
  endsAt: z.date().nullish(),
})

const surveySchema = surveyCreate.and(
  z.object({
    id: z.number(),
  })
)

const listSchema = listOf(surveySchema)
const list = procedure.output(listSchema).query(async () => {
  const surveys = await listSurveys()

  const dto = surveys.map(s => ({
    id: s.id,
    title: s.title,
    endsAt: s.ends_at,
  }))

  return {
    data: (dto ?? []) as z.infer<typeof surveySchema>[],
    meta: {
      count: await countSurveys(),
    },
  }
})

const getById = procedure
  .output(surveySchema)
  .input(z.number())
  .query(async ({ input }) => {
    const survey = await findSurvey(input)

    if (!survey) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        cause: 'Could not find survey.',
      })
    }

    return survey
  })

const create = procedure
  .input(surveyCreate.and(z.object({ posts: z.array(z.string()) })))
  .output(surveySchema)
  .mutation(async ({ input }) => {
    const survey = await createSurvey({
      title: input.title,
      ends_at: input.endsAt,
      postIds: input.posts,
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
  getById,
})
