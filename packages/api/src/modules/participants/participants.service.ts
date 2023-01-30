import { db } from '../../database/client.js'
import { Participants } from 'database/database.js'
import { findSurvey } from 'modules/survey/survey.service.js'

export async function createParticipant(data: Omit<Participants, 'id' | 'created_at'>) {
  const survey = await findSurvey(data.survey_id)

  if (!survey) {
    throw new Error("Couln't find survey.")
  }
  if (survey?.ends_at && survey.ends_at < new Date()) {
    throw new Error('Survey is expired. Sorry.')
  }

  // @ts-expect-error
  const response = await db
    .insertInto('participants')
    .values({
      survey_id: data.survey_id,
      external_platform: data.external_platform,
      external_participant_id: data.external_participant_id,
      age_range: data.age_range,
      gender: data.gender,
      nationality: data.nationality,
      marital_status: data.marital_status,
      academic_status: data.academic_status,
      employment_status: data.employment_status,
      annual_income_level: data.annual_income_level,
      onboarding_answers: data.onboarding_answers,
    })
    .returningAll()
    .executeTakeFirst()

  return response
}
