import type { CrawlInput } from '@credee/shared/reddit/types'
import { Job, RepeatOptions } from 'bullmq'
import { redis } from '../../core/redis'
import { RedditCrawler } from './queues/reddit'

export async function getJobsInQueue() {
  const jobs = await RedditCrawler.queue.getJobs(['active', 'completed', 'delayed', 'failed', 'paused', 'waiting'])

  return Promise.all(
    jobs.map(async job => ({
      id: job.id,
      subreddit: job.data.subreddit,
      state: await job.getState(),
      createdAt: job.timestamp,
      startedAt: job.processedOn,
      completedAt: job.finishedOn,
      progress: `${job.progress}/${job.data.count}`,
    }))
  )
}

export async function getActiveJobs() {
  const jobs = await RedditCrawler.queue.getRepeatableJobs()
  return Promise.all(
    jobs.map(async job => {
      const data = await getJobMetadata(job.key)
      return {
        ...job,
        subreddit: data?.subreddit,
        count: Number(data?.count),
        pattern: data?.repeat?.every,
        running: data.running ?? false,
      }
    })
  )
}

export async function removeJob(jobKey: string) {
  await RedditCrawler.queue.removeRepeatableByKey(jobKey)
  await redis.json.del(`metadata:${jobKey}`)
}

export async function queueRedditCrawl(data: CrawlInput, repeat: RepeatOptions) {
  const jobKey = `${data.subreddit}:::${data.count}`
  const job = await RedditCrawler.queue.add(data.subreddit, data, {
    repeat: repeat,
    jobId: jobKey,
  })

  await setJobMetadata(job.repeatJobKey!, {
    count: data.count || 5,
    subreddit: data.subreddit,
    repeat,
    scrapedCount: 0,
  })
}

interface JobMetadata {
  running?: boolean
  subreddit: string
  count: number
  scrapedCount: number
  repeat: RepeatOptions
}

async function setJobMetadata(jobId: string, payload: JobMetadata) {
  await redis.json.set(`metadata:${jobId}`, '$', payload as any)
}

export async function updateJobMetadata<T extends keyof JobMetadata>(jobId: string, key: T, value: JobMetadata[T]) {
  await redis.json.set(`metadata:${jobId}`, `$.${key}`, value as any)
}

export async function getJobMetadata(jobId: string): Promise<JobMetadata> {
  return (await redis.json.get(`metadata:${jobId}`)) as any
}
