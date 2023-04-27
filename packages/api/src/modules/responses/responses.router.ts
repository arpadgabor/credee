import { z } from 'zod'
import { procedure, router } from '../../core/trpc'
import { createCredibilityResponse } from './responses.service'

const credibilityResponseCreate = z.object({
  postId: z.string(),
  participantId: z.number(),
  postVariantId: z.number(),
  surveyId: z.number(),

  response: z.object({
    credibility: z.number(),
    contentStyle: z.string(),
    contentStyleOther: z.string().nullish(),
    contentStyleEffect: z.number(),
    topicFamiliarity: z.number(),
    theirRating: z.enum(['upvote', 'downvote']),
    theirRatingWhy: z.string(),
  }),
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
    const result = await createCredibilityResponse({
      post_id: input.postId,
      participant_id: input.participantId,
      post_variant_id: input.postVariantId,
      survey_id: input.surveyId,
      response: {
        credibility: input.response.credibility,
        content_style: input.response.contentStyle,
        content_style_other: input.response.contentStyleOther,
        content_style_effect: input.response.contentStyleEffect,
        topic_familiarity: input.response.topicFamiliarity,
        their_rating: input.response.theirRating,
        their_rating_why: input.response.theirRatingWhy,
      },
    })

    return {
      id: result!.id,
      postId: result!.post_id,
      participantId: result!.participant_id,
      postVariantId: result!.post_variant_id,
      surveyId: result!.survey_id,
      response: {
        credibility: result!.response!.credibility,
        contentStyle: result!.response!.content_style,
        topicFamiliarity: result!.response!.topic_familiarity,
        contentStyleEffect: result!.response!.content_style_effect,
        contentStyleOther: result!.response!.content_style_other,
        theirRating: result!.response!.their_rating,
        theirRatingWhy: result!.response!.their_rating_why,
      },
    }
  })

export const ResponsesRouter = router({
  addCredibility,
})
