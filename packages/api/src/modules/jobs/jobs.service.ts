import { Reddit } from './queues/reddit.js'
import { CrawlInput } from '@credee/shared/reddit/queue.types.js'

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
      progress: `${job.progress}/${job.data.stopsAfterCount}`,
    }))
  )
}

export async function removeJob(jobId: string) {
  await Reddit.queue.remove(jobId)
}

export async function queueRedditCrawl(data: CrawlInput) {
  return Reddit.queue.add(data.subreddit, data)
}
