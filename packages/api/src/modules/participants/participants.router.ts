import { ExternalPlatform, ExternalPlatforms, Participants, db } from '@credee/shared/database'
import { z } from 'zod'
import { procedure, router } from '../../core/trpc'
import { createParticipant } from './participants.service'
import { TRPCError } from '@trpc/server'

const responseShape = z.object({
  age: z.number().nullish(),
  gender: z.enum(['male', 'female', 'other']).nullish(),
  nationality: z.string().nullish(),
  academicStatus: z.string().nullish(),
  academicField: z.string().nullish(),
  redditUsage: z.number().nullish(),
  socialMediaUsage: z.number().nullish(),
  fakeNewsAbility: z.number().nullish(),
  redditAsNewsSource: z.string().nullish(),
  credibilityEvaluation: z.string().nullish(),
})

const participantCreate = z.object({
  surveyId: z.number(),
  externalPlatform: z.enum(ExternalPlatforms as [string, ...string[]]),
  externalParticipantId: z.string().nullish(),

  response: responseShape,
})

const participant = participantCreate.and(
  z.object({
    id: z.number(),
    createdAt: z.date(),
  })
)

const addParticipant = procedure
  .input(participantCreate)
  .output(participant)
  .mutation(async ({ input }) => {
    const participant = await createParticipant({
      survey_id: input.surveyId,
      external_platform: input.externalPlatform as keyof typeof ExternalPlatform,
      external_participant_id: input.externalParticipantId,
      response: {
        age: input.response.age,
        gender: input.response.gender,
        nationality: input.response.nationality,
        academic_status: input.response.academicStatus,
        academic_field: input.response.academicStatus,

        reddit_usage: input.response.redditUsage,
        fake_news_ability: input.response.fakeNewsAbility,
        social_media_usage: input.response.socialMediaUsage,

        reddit_as_news_source: input.response.redditAsNewsSource,
      },
    })

    return {
      id: participant!.id,
      surveyId: participant!.survey_id,
      externalPlatform: participant!.external_platform,
      externalParticipantId: participant!.external_participant_id,
      response: {
        age: participant?.response?.age,
        gender: participant?.response?.gender,
        nationality: participant?.response?.nationality,
        academicStatus: participant?.response?.academic_status,
        academicField: participant?.response?.academic_field,

        redditUsage: participant?.response?.reddit_usage,
        fakeNewsAbility: participant?.response?.fake_news_ability,
        socialMediaUsage: participant?.response?.social_media_usage,

        redditAsNewsSource: participant?.response?.reddit_as_news_source,
      },
      createdAt: participant!.created_at,
    }
  })

const updateResponse = procedure
  .input(
    z.object({
      participantId: z.number(),
      response: responseShape.pick({ redditAsNewsSource: true, credibilityEvaluation: true }),
    })
  )
  .mutation(async ({ input }) => {
    const participant = await db.selectFrom('participants').where('id', '=', input.participantId).executeTakeFirst()

    if (!participant) throw new TRPCError({ code: 'NOT_FOUND', message: 'Participant not found' })

    await db
      .updateTable('participants')
      .set({
        response: {
          ...((participant as Participants)?.response || {}),
          reddit_as_news_source: input.response.redditAsNewsSource,
          credibility_evaluation: input.response.credibilityEvaluation,
        },
      })
      .execute()

    return true
  })

export const ParticipantsRouter = router({
  onboard: addParticipant,
  updateResponse,
})
