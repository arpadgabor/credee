import { Kysely } from 'kysely'
import { participantsTable, responsesTable, surveysTable } from './004-survey.js'

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(participantsTable).addColumn('response', 'jsonb').execute()
  await db.schema.alterTable(responsesTable).addColumn('response', 'jsonb').execute()

  const participants = await db.selectFrom(participantsTable).selectAll().execute()
  await Promise.all(
    participants.map(async participant => {
      await db
        .updateTable(participantsTable)
        .set({
          response: {
            age: null,
            gender: participant.gender,
            nationality: participant.nationality,
            academic_status: participant.academic_status,
            reddit_usage: participant.reddit_usage,
            social_media_usage: participant.social_media_usage,
            fake_news_ability: participant.fake_news_ability,
          },
        })
        .where('id', '=', participant.id)
        .execute()

      console.log(`Migrated participant ${participant.id}`)
    })
  )

  const responses = await db.selectFrom(responsesTable).selectAll().execute()

  await Promise.all(
    responses.map(async response => {
      await db
        .updateTable(responsesTable)
        .set({
          response: {
            credibility: response.credibility,
            content_style: response.content_style,
            content_style_other: response.content_style_other,
            content_style_effect: response.content_style_effect,
            topic_familiarity: response.topic_familiarity,
          },
        })
        .where('id', '=', response.id)
        .execute()

      console.log(`Migrated response ${response.id}`)
    })
  )

  await db.schema
    .alterTable(responsesTable)
    .dropColumn('credibility')
    .dropColumn('content_style')
    .dropColumn('content_style_other')
    .dropColumn('content_style_effect')
    .dropColumn('topic_familiarity')
    .execute()

  await db.schema
    .alterTable(participantsTable)
    .dropColumn('age_range')
    .dropColumn('gender')
    .dropColumn('nationality')
    .dropColumn('marital_status')
    .dropColumn('academic_status')
    .dropColumn('employment_status')
    .dropColumn('annual_income_level')
    .dropColumn('onboarding_answers')
    .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
  throw new Error('Not implemented down')
}
