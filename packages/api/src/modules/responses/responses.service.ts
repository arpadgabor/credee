import { db } from '@credee/shared/database'
import type { ResponsesCredibility } from '@credee/shared/database'
import { findSurvey } from '../../modules/survey/survey.service'

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
      content_style: data.content_style,
      content_style_other: data.content_style_other,
      content_style_effect: data.content_style_effect,
      topic_familiarity: data.topic_familiarity,
    })
    .returningAll()
    .executeTakeFirst()

  return response
}
