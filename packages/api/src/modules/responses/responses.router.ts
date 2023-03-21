import { z } from 'zod'
import { procedure, router } from '../../core/trpc'
import { createCredibilityResponse } from './responses.service'

const credibilityResponseCreate = z.object({
  credibility: z.number(),
  contentStyle: z.string(),
  contentStyleOther: z.string().nullish(),
  contentStyleEffect: z.number(),
  topicFamiliarity: z.number(),
  postId: z.string(),
  participantId: z.number(),
  postVariantId: z.number(),
  surveyId: z.number(),
})

const credibilityResponseOutput = credibilityResponseCreate.and(
  z.object({
    id: z.number(),
  })
)

const addCredibility = procedure
  .input(credibilityResponseCreate)
  .output(credibilityResponseOutput)
  .mutation(async ({ input }) => {
    const response = await createCredibilityResponse({
      credibility: input.credibility,
      post_id: input.postId,
      participant_id: input.participantId,
      post_variant_id: input.postVariantId,
      survey_id: input.surveyId,
      content_style: input.contentStyle,
      content_style_other: input.contentStyleOther,
      content_style_effect: input.contentStyleEffect,
      topic_familiarity: input.topicFamiliarity,
    })

    return {
      id: response!.id,
      credibility: response!.credibility,
      postId: response!.post_id,
      participantId: response!.participant_id,
      postVariantId: response!.post_variant_id,
      surveyId: response!.survey_id,
      contentStyle: response!.content_style,
      topicFamiliarity: response!.topic_familiarity,
      contentStyleEffect: response!.content_style_effect,
      contentStyleOther: response!.content_style_other,
    }
  })

export const ResponsesRouter = router({
  addCredibility,
})
