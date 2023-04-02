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
  updateSurvey,
} from './survey.service'
import { getSurveyDetails, surveyDetails } from './survey-details.service'

const surveyCreate = z.object({
  title: z.string(),
  redirectUrl: z.string().url(),
  description: z.any().nullish(),
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
    redirectUrl: s.redirect_url || 'https://missing.url/',
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

    return {
      id: survey.id,
      title: survey.title,
      endsAt: survey.ends_at,
      description: survey.description,
      redirectUrl: survey.redirect_url || 'https://missing.url/',
    }
  })

const create = procedure
  .input(surveyCreate)
  .output(surveySchema)
  .mutation(async ({ input }) => {
    const survey = await createSurvey({
      title: input.title,
      ends_at: input.endsAt,
      redirect_url: input.redirectUrl,
      description: input.description,
    })

    return {
      id: survey.id,
      title: survey.title,
      endsAt: survey.ends_at,
      redirectUrl: survey.redirect_url!,
      description: survey.description,
    }
  })

const update = procedure
  .input(surveySchema)
  .output(surveySchema)
  .mutation(async ({ input }) => {
    const survey = await updateSurvey(input.id, {
      title: input.title,
      ends_at: input.endsAt,
      redirect_url: input.redirectUrl,
      description: input.description,
    })

    return {
      id: survey.id,
      title: survey.title,
      endsAt: survey.ends_at,
      redirectUrl: survey.redirect_url!,
      description: survey.description,
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
  // .output(surveyDetails.output)
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
  update,
  list,
  getById,
  nextQuestion,
  getByIdDetailed,
  addVariantToSurvey,
})
