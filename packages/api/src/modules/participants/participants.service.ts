import { db } from '@credee/shared/database'
import type { Participants } from '@credee/shared/database'
import { findSurvey } from '../../modules/survey/survey.service'
import { TRPCError } from '@trpc/server'

export async function createParticipant(data: Omit<Participants, 'id' | 'created_at'>) {
  const survey = await findSurvey(data.survey_id)

  if (!survey) {
    throw new TRPCError({ code: 'NOT_FOUND', message: "Couln't find survey." })
  }
  if (survey?.ends_at && survey.ends_at < new Date()) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'Survey is expired. Sorry.' })
  }

  // if a participant tries to start the same survey again, just return their data
  const participant = await db
    .selectFrom('participants')
    .selectAll()
    .where('survey_id', '=', data.survey_id)
    .where('external_participant_id', '=', data.external_participant_id)
    .executeTakeFirst()

  if (participant) return participant

  const response = await db
    .insertInto('participants')
    .values({
      survey_id: data.survey_id,
      external_platform: data.external_platform,
      external_participant_id: data.external_participant_id,
      response: {
        age: data?.response?.age,
        gender: data?.response?.gender,
        nationality: data?.response?.nationality,
        academic_status: data?.response?.academic_status,
        academic_field: data?.response?.academic_field,
        reddit_usage: data?.response?.reddit_usage,
        social_media_usage: data?.response?.social_media_usage,
      },
    })
    .returningAll()
    .executeTakeFirst()

  return response
}
