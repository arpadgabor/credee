import { db } from '../../database/client.js'
import { ResponsesCredibility } from '../../database/database.js'
import { findSurvey } from '../../modules/survey/survey.service.js'

export async function createCredibilityResponse(data: Omit<ResponsesCredibility, 'id'>) {
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
      credibility: data.credibility,
      post_id: data.post_id,
      participant_id: data.participant_id,
      post_variant_id: data.post_variant_id,
      survey_id: data.survey_id,
    })
    .returningAll()
    .executeTakeFirst()

  return response
}
