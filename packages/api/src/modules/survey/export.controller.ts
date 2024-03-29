import { z } from 'zod'
import { server } from '../../core/fastify'
import { getSurveyDetails } from './survey-details.service'
import { stringify as toCsv } from 'csv-stringify/sync'

server.get('/surveys/:id/responses.csv', async (req, reply) => {
  const path = z.object({ id: z.string() }).parse(req.params)

  const { answers } = await getSurveyDetails({ surveyId: Number(path.id) })

  const csv = toCsv(
    answers.map(({ post, ...rest }) => ({
      'Responded At': new Date(rest.respondedAt).toLocaleString(),
      'External Platform': rest.externalPlatform,
      'Participant ID': rest.participantId,
      '[Participant] Gender': rest.gender,
      '[Participant] Age': rest.age,
      '[Participant] Studies Level': rest.academicStatus,
      '[Participant] Reddit Usage': rest.redditUsage,
      '[Participant] Social Media Usage': rest.socialMediaUsage,
      '[Participant] Fake News Ability': rest.fakeNewsAbility,
      '[Participant] Reddit As News Source': rest.redditAsNewsSource,
      '[Participant] Reddit Credibility Evaluation': rest.credibilityEvaluation,

      '[Credibility] Credibility Rating': rest.credibility,
      '[Credibility] Would upvote': rest.theirRating,
      '[Credibility] Would upvote reason': rest.theirRatingWhy,
      '[Credibility] Topic familiarity': rest.familiarity,
      '[Credibility] Content Style': rest.contentStyle,
      '[Credibility] Content Style Effect': rest.contentStyleOther || rest.contentStyleEffect,

      '[Post] Title': post.title,
      '[Post] Title Sentiment': post.titleSentiment,
      '[Post] Link Domain': post.domain,
      '[Post] Subreddit': post.subreddit,
      '[Post] Award Count': post.goldCount,
      '[Post] Comments': post.comments,
      '[Post] Upvote Ratio': post.ratio,
      '[Post] Upvotes': post.upvotes,
      '[Post] Posted At': post.postedAt ? new Date(post.postedAt).toLocaleString() : '',
    })),
    {
      header: true,
    }
  )

  reply.header('Content-Type', 'text/csv')
  reply.send(csv)
})
