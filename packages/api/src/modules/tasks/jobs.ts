import { createCrawlQueue } from '@credee/worker'
import { config } from '../../config.js'

const { sendCrawlInput, outputQueue, inputQueue } = createCrawlQueue(config.get('redisUrl'))

outputQueue.process((job, done) => {
  console.log(job.data)
  done()
})

export async function getJobsInQueue() {
  const jobs = await inputQueue.getJobs(['active', 'completed', 'delayed', 'failed', 'paused', 'waiting'])

  return Promise.all(
    jobs.map(async job => ({
      id: job.id,
      data: job.data,
      state: await job.getState(),
      createdAt: job.timestamp,
      startedAt: job.processedOn,
      completedAt: job.finishedOn,
    }))
  )
}

export { sendCrawlInput }
