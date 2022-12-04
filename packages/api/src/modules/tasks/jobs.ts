import { createCrawlQueue } from '@credee/worker'
import { config } from '../../config.js'

const { sendCrawlInput, outputQueue, inputQueue } = createCrawlQueue(config.get('redisUrl'))

outputQueue.process((job, done) => {
  done(null, job.data)
})

export async function getJobsInQueue() {
  const jobs = await inputQueue.getJobs(['active', 'completed', 'delayed', 'failed', 'paused', 'waiting'])

  return Promise.all(
    jobs.map(async job => ({
      id: job.id,
      subreddit: job.data.subreddit,
      state: await job.getState(),
      createdAt: job.timestamp,
      startedAt: job.processedOn,
      completedAt: job.finishedOn,
    }))
  )
}

export { sendCrawlInput }
