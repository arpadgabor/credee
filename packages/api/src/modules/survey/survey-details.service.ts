import { db } from '@credee/shared/database'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const surveyDetails = {
  input: z.object({
    surveyId: z.number(),
  }),
}

export async function getSurveyDetails({ surveyId }: z.infer<typeof surveyDetails.input>) {
  const survey = await db.selectFrom('surveys').selectAll().where('id', '=', surveyId).executeTakeFirst()

  if (!survey) {
    throw new TRPCError({ code: 'NOT_FOUND', message: 'Survey does not exist.' })
  }

  const responses = await db
    .selectFrom('responses_credibility')
    .leftJoin('reddit_posts', 'reddit_posts.id', 'responses_credibility.post_variant_id')
    .leftJoin('participants', 'participants.id', 'responses_credibility.participant_id')
    .select([
      'responses_credibility.id',
      'responses_credibility.post_variant_id',
      'responses_credibility.post_id',
      'responses_credibility.response as credibility_response',

      'participants.external_participant_id',
      'participants.created_at as responded_at',
      'participants.external_platform',
      'participants.response as participant_response',

      'reddit_posts.title as post_title',
      'reddit_posts.title_sentiment as post_title_sentiment',
      'reddit_posts.gold_count',
      'reddit_posts.created_at as posted_at',
      'reddit_posts.domain',
      'reddit_posts.nr_of_comments',
      'reddit_posts.ratio',
      'reddit_posts.score',
      'reddit_posts.screenshot_filename',
      'reddit_posts.subreddit',
    ])
    .where('responses_credibility.survey_id', '=', surveyId)
    .orderBy('responses_credibility.participant_id')
    // .orderBy('responses_credibility.')
    .execute()

  const variants = await db
    .selectFrom('survey_reddit_dataset')
    .where('survey_id', '=', surveyId)
    .leftJoin('reddit_posts', 'reddit_posts.id', 'survey_reddit_dataset.post_variant_id')
    .select([
      'reddit_posts.id',
      'reddit_posts.post_id as postId',
      'reddit_posts.author',
      'reddit_posts.domain',
      'reddit_posts.flair',
      'reddit_posts.nr_of_comments as nrOfComments',
      'reddit_posts.permalink',
      'reddit_posts.screenshot_filename as screenshot',
      'reddit_posts.ratio',
      'reddit_posts.score',
      'reddit_posts.subreddit',
      'reddit_posts.title',
      'reddit_posts.title_sentiment as titleSentiment',
      'reddit_posts.url',
      'reddit_posts.url_title as urlTitle',
      'reddit_posts.gold_count as goldCount',
      'reddit_posts.created_at as createdAt',
      'reddit_posts.created_at as insertedAt',
    ])
    .execute()

  return {
    title: survey.title,
    deadline: survey.ends_at,
    redirectUrl: survey.redirect_url || '-',
    description: survey.description,
    answers: responses.map(r => {
      return {
        respondedAt: r.responded_at!,

        participantId: r.external_participant_id,

        credibility: r.credibility_response.credibility,
        contentStyle: r.credibility_response.content_style,
        contentStyleEffect: r.credibility_response.content_style_effect,
        contentStyleOther: r.credibility_response.content_style_other,
        theirRating: r.credibility_response.their_rating,
        theirRatingWhy: r.credibility_response.their_rating_why,

        age: r.participant_response?.age,
        gender: r.participant_response?.gender,
        academicStatus: r.participant_response?.academic_status,
        academicField: r.participant_response?.academic_field,
        redditUsage: r.participant_response?.reddit_usage,
        socialMediaUsage: r.participant_response?.social_media_usage,
        fakeNewsAbility: r.participant_response?.fake_news_ability,
        redditAsNewsSource: r.participant_response?.reddit_as_news_source,

        externalPlatform: r.external_platform,

        post: {
          title: r.post_title!,
          titleSentiment: r.post_title_sentiment || 0,
          domain: r.domain || '',
          subreddit: r.subreddit!,
          goldCount: r.gold_count || 0,
          comments: r.nr_of_comments || 0,
          ratio: r.ratio!,
          upvotes: r.score!,
          postedAt: r.posted_at ? new Date(r.posted_at) : undefined,
          screenshot: r.screenshot_filename,
        },
      }
    }),
    variants,
  }
}
