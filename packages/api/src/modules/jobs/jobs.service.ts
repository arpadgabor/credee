import type { CrawlInput } from '@credee/shared/reddit/types'
import { RepeatOptions } from 'bullmq'
import { redis } from '../../core/redis.js'
import { Reddit } from './queues/reddit.js'

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

export async function getActiveJobs() {
  const jobs = await Reddit.queue.getRepeatableJobs()
  return Promise.all(
    jobs.map(async job => {
      const data = await redis.hGetAll(`data:${job.key}`)
      console.log(data)
      return {
        ...job,
        subreddit: data.subreddit,
        count: Number(data.stopsAfterCount),
      }
    })
  )
}

export async function removeJob(jobKey: string) {
  await Reddit.queue.removeRepeatableByKey(jobKey)
  await redis.hDel('data:' + jobKey, ['subreddit', 'count'])
}

export async function queueRedditCrawl(data: CrawlInput, repeat: RepeatOptions) {
  const job = await Reddit.queue.add(data.subreddit, data, {
    repeat: repeat,
  })

  try {
    await redis.hSet('data:' + job.repeatJobKey!, 'subreddit', data.subreddit)
    await redis.hSet('data:' + job.repeatJobKey!, 'count', String(data.stopsAfterCount))
  } catch (e) {
    console.log(e)
    await job.remove()
  }
}
