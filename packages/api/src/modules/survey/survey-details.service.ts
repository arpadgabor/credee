import { db } from '@credee/shared/database'
import { TRPCError } from '@trpc/server'
import { z } from 'zod'

export const surveyDetails = {
  input: z.object({
    surveyId: z.number(),
  }),
  output: z.object({
    title: z.string(),
    deadline: z.date().nullish(),
    answers: z.array(
      z.object({
        participantId: z.string().nullish(),
        credibility: z.number(),
        contentStyle: z.string(),
        contentStyleEffect: z.number(),
        contentStyleOther: z.string().nullish(),
        academicStatus: z.string().nullish(),
        ageRange: z.string().nullish(),
        respondedAt: z.date(),
        gender: z.string().nullish(),
        externalPlatform: z.string().nullish(),
        onboardingAnswers: z.any(),
        post: z.object({
          title: z.string(),
          titleSentiment: z.number(),
          subreddit: z.string(),
          domain: z.string(),
          upvotes: z.number(),
          ratio: z.number(),
          comments: z.number(),
          goldCount: z.number(),
          postedAt: z.date().nullish(),
          screenshot: z.string().nullish(),
        }),
      })
    ),
  }),
}

export async function getSurveyDetails({
  surveyId,
}: z.infer<typeof surveyDetails.input>): Promise<z.infer<typeof surveyDetails.output>> {
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
      'credibility',
      'content_style',
      'content_style_effect',
      'content_style_other',
      'responses_credibility.post_id',

      'participants.external_participant_id',
      'participants.academic_status',
      'participants.age_range',
      'participants.created_at as responded_at',
      'participants.gender',
      'participants.external_platform',
      'participants.onboarding_answers',

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

  return {
    title: survey.title,
    deadline: survey.ends_at,
    answers: responses.map(r => ({
      participantId: r.external_participant_id,
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
      credibility: r.credibility,
      contentStyle: r.content_style,
      contentStyleEffect: r.content_style_effect,
      contentStyleOther: r.content_style_other,
      academicStatus: r.academic_status,
      ageRange: r.age_range,
      respondedAt: r.responded_at!,
      gender: r.gender,
      externalPlatform: r.external_platform,
      onboardingAnswers: r.onboarding_answers,
    })),
  }
}
