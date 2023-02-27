import { sql, Survey } from '@credee/shared/database'
import { db } from '@credee/shared/database'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

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

export const nextSurveyQuestion = {
  input: z.object({
    participantId: z.number(),
    surveyId: z.number(),
  }),
  output: z.object({
    post: z.object({
      screenshot_filename: z.string(),
      title: z.string(),
      score: z.number(),
      inserted_at: z.date().optional(),
      id: z.number(),
      post_id: z.string(),
    }),
    remaining: z.number(),
  }),
}
export async function getNextSurveyQuestion({
  participantId,
  surveyId,
}: z.infer<(typeof nextSurveyQuestion)['input']>): Promise<z.infer<(typeof nextSurveyQuestion)['output']>> {
  const survey = await db.selectFrom('surveys').selectAll().where('id', '=', surveyId).executeTakeFirst()
  if (!survey) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Survey does not exist.' })
  }

  const query = db
    .with('post_answers', q =>
      q
        .selectFrom('responses_credibility')
        .select(['post_id', q => sql<string>`count(*)`.as('total')])
        .groupBy(['post_id'])
        .where('survey_id', '=', surveyId)
        .where('participant_id', '=', participantId)
    )
    .with('variant_answers', q =>
      q
        .selectFrom('responses_credibility')
        .select(['post_variant_id', q => sql<string>`count(*)`.as('total')])
        .groupBy(['post_variant_id'])
        .where('survey_id', '=', surveyId)
    )
    .with('unanswered', q =>
      q
        .selectFrom('survey_reddit_dataset as dataset')
        .leftJoin('reddit_posts as posts', 'posts.id', 'dataset.post_variant_id')
        .leftJoin('post_answers', 'post_answers.post_id', 'posts.post_id')
        .select(['posts.post_id'])
        .where('dataset.survey_id', '=', surveyId)
        .groupBy(['posts.post_id', 'post_answers.total'])
        .having('post_answers.total', 'is', null)
    )
    .selectFrom('survey_reddit_dataset as dataset')
    .select(['dataset.post_variant_id'])
    .leftJoin('reddit_posts as post', 'post.id', 'dataset.post_variant_id')
    .leftJoin('variant_answers', 'variant_answers.post_variant_id', 'dataset.post_variant_id')
    .where('post.post_id', 'in', q => q.selectFrom('unanswered').select(['unanswered.post_id']))
    .orderBy('variant_answers.total', 'desc')

  const result = await query.execute()

  if (!result.length) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'SURVEY_DONE' })
  }

  const post = await db
    .selectFrom('reddit_posts')
    .select(['screenshot_filename', 'title', 'score', 'inserted_at', 'id', 'post_id'])
    .where('id', '=', result[0].post_variant_id)
    .executeTakeFirst()

  if (!post) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something bad happened.' })
  }

  return {
    post,
    remaining: result.length - 1,
  }
}
