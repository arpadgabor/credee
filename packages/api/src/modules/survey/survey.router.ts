import { TRPCError } from '@trpc/server'
import { z } from 'zod'
import { procedure, router } from '../../core/trpc'
import { createListSchema as listOf } from '../../core/zod'
import {
  assignVariantToSurvey,
  countSurveys,
  createSurvey,
  findSurvey,
  getNextSurveyQuestion,
  listSurveys,
  nextSurveyQuestion,
} from './survey.service.js'
import { getSurveyDetails, surveyDetails } from './survey-details.service'

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

const nextQuestion = procedure
  .input(nextSurveyQuestion.input)
  .output(nextSurveyQuestion.output)
  .query(async ({ input }) => {
    const question = await getNextSurveyQuestion(input)

    return question
  })

const getByIdDetailed = procedure
  .output(surveyDetails.output)
  .input(surveyDetails.input)
  .query(async ({ input }) => {
    const survey = await getSurveyDetails(input)

    return survey
  })

const addVariantToSurvey = procedure
  .input(z.object({ variantId: z.number(), surveyId: z.number() }))
  // .input(surveyDetails.input)
  .mutation(async ({ input }) => {
    const data = await assignVariantToSurvey(input.variantId, input.surveyId)

    return data
  })

export const SurveyRouter = router({
  create,
  list,
  getById,
  nextQuestion,
  getByIdDetailed,
  addVariantToSurvey,
})
