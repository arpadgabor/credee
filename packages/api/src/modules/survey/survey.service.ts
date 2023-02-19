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
    screenshot_filename: z.string(),
    title: z.string(),
    score: z.number(),
    inserted_at: z.date().optional(),
    id: z.number(),
    post_id: z.string(),
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

  const result = await db
    .with('answers', q =>
      q
        .selectFrom('responses_credibility')
        .select(['post_variant_id', 'survey_id', q => sql<string>`count(*)`.as('response_count')])
        .groupBy(['post_variant_id', 'survey_id'])
        .where('survey_id', '=', surveyId)
        .where('participant_id', '=', participantId)
    )
    .selectFrom('survey_reddit_dataset')
    .leftJoin('answers', 'answers.post_variant_id', 'survey_reddit_dataset.post_variant_id')
    .select(['survey_reddit_dataset.id', 'survey_reddit_dataset.survey_id', 'survey_reddit_dataset.post_variant_id'])
    .where('survey_reddit_dataset.survey_id', '=', surveyId)
    .orderBy('answers.response_count', 'desc')
    .executeTakeFirst()

  if (!result) {
    throw new TRPCError({ code: 'BAD_REQUEST', message: 'There are no more questions to be answered.' })
  }

  const post = await db
    .selectFrom('reddit_posts')
    .select(['screenshot_filename', 'title', 'score', 'inserted_at', 'id', 'post_id'])
    .where('id', '=', result?.post_variant_id)
    .executeTakeFirst()

  if (!post) {
    throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Something bad happened.' })
  }

  return post
}

/*
with answers as (
	select
		count(*) as response_count,
		post_variant_id,
		survey_id,
		post_id
	from responses_credibility
	group by post_variant_id, survey_id, post_id
)
select dataset.*, answers.response_count, answers.post_id
from survey_reddit_dataset dataset
left join answers on answers.post_variant_id = dataset.post_variant_id
order by answers.response_count desc
*/
