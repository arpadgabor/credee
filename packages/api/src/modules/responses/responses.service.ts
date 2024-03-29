import { db } from '@credee/shared/database'
import type { ResponsesCredibility } from '@credee/shared/database'
import { findSurvey } from '../../modules/survey/survey.service'

export async function createCredibilityResponse(data: Omit<ResponsesCredibility, 'id' | 'created_at'>) {
  const survey = await findSurvey(data.survey_id)

  if (!survey) {
    throw new Error("Couln't find survey.")
  }
  if (survey?.ends_at && survey.ends_at < new Date()) {
    throw new Error('Survey is expired. Sorry.')
  }

  const response = await db
    .insertInto('responses_credibility')
    .values({
      post_id: data.post_id,
      participant_id: data.participant_id,
      post_variant_id: data.post_variant_id,
      survey_id: data.survey_id,
      response: data.response,
    })
    .returningAll()
    .executeTakeFirst()

  return response
}
