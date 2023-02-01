import { z } from 'zod'
import { procedure, router } from '../../core/trpc.js'
import { createCredibilityResponse } from './responses.service.js'

const credibilityResponseCreate = z.object({
  credibility: z.number(),
  postId: z.string(),
  participantId: z.number(),
  postVariantId: z.number(),
  surveyId: z.number(),
})

const credibilityResponse = credibilityResponseCreate.and(
  z.object({
    id: z.number(),
  })
)

const addCredibility = procedure
  .input(credibilityResponseCreate)
  .output(credibilityResponse)
  .mutation(async ({ input }) => {
    const response = await createCredibilityResponse({
      credibility: input.credibility,
      post_id: input.postId,
      participant_id: input.participantId,
      post_variant_id: input.postVariantId,
      survey_id: input.surveyId,
    })

    return {
      id: response!.id,
      credibility: response!.credibility,
      postId: response!.post_id,
      participantId: response!.participant_id,
      postVariantId: response!.post_variant_id,
      surveyId: response!.survey_id,
    }
  })

export const ResponsesRouter = router({
  addCredibility,
})
