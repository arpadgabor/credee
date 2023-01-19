import { Reddit } from '@credee/worker'
import { db, json } from '../../database/client.js'
import { Job } from 'bullmq'

Reddit.queueEvents.on('completed', async ({ jobId }, id) => {
  const job = await Job.fromId<Reddit.Input, Reddit.Output>(Reddit.queue, jobId)
  console.log({ job })

  const { posts } = job.returnvalue
  console.log(`Saving crawled posts for job "${jobId}".`)

  await Promise.all(
    posts.map(async post => {
      await db
        .insertInto('reddit_posts')
        .values({
          post_id: post.id,
          title: post.title,
          screenshot_filename: post.screenshotPath!,

          domain: post.domain,
          url: post.url,
          url_title: post.urlTitle,

          ratio: post.ratio,
          score: post.score,
          awards: json(post.awards),

          permalink: post.permalink,
          author: post.author,
          subreddit: job.data.subreddit,

          nr_of_comments: post.nrOfComments,
          comments_raw: json(post.comments),

          media: json(post.media),
          gold_count: post.goldCount,
          is_cross_post: post.isCrossPost,
          is_image: post.isImage,
          is_link: post.isLink,
          is_original_content: post.isOriginalContent,
          is_self_post: post.isSelfPost,
          is_video: post.isVideo,

          created_at: new Date(post.createdAt),
        })
        .execute()
    })
  )
})

export async function getJobsInQueue() {
  const jobs = await Reddit.queue.getJobs(['active', 'completed', 'delayed', 'failed', 'paused', 'waiting'])

  return Promise.all(
    jobs.map(async job => ({
      id: job.id,
      subreddit: job.data.subreddit,
      state: await job.getState(),
      createdAt: job.timestamp,
      startedAt: job.processedOn,
      completedAt: job.finishedOn,
      progress: job.progress,
    }))
  )
}

export async function queueRedditCrawl(data: Reddit.Input) {
  return Reddit.queue.add(data.subreddit, data)
}
