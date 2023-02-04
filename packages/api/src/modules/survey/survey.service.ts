import type { Survey } from '@credee/shared/database'
import { db } from '@credee/shared/database'

export async function createSurvey(values: Pick<Survey, 'title' | 'ends_at'> & { postIds: string[] }) {
  const posts = await db.selectFrom('reddit_posts').select('id').where('post_id', 'in', values.postIds).execute()

  const survey = await db.transaction().execute(async trx => {
    const [survey] = await trx
      .insertInto('surveys')
      .values({
        title: values.title,
        ends_at: values.ends_at,
      })
      .returningAll()
      .execute()

    trx
      .insertInto('survey_reddit_dataset')
      .values(
        posts.map(post => ({
          survey_id: survey.id,
          post_variant_id: post.id,
        }))
      )
      .execute()

    return survey
  })

  return survey
}

export async function createSurveyDataset(surveyId: number, postVariantIds: number[]) {
  const result = await db
    .insertInto('survey_reddit_dataset')
    .values(
      postVariantIds.map(id => ({
        post_variant_id: id,
        survey_id: surveyId,
      }))
    )
    .returningAll()
    .execute()

  return result
}

export async function findSurvey(id: number) {
  return await db.selectFrom('surveys').selectAll().where('id', '=', id).executeTakeFirst()
}

export async function listSurveys() {
  return await db.selectFrom('surveys').selectAll().execute()
}
export async function countSurveys() {
  const result = await db.selectFrom('surveys').select(db.fn.count('id').as('count')).executeTakeFirst()

  return Number(result?.count) || 0
}
