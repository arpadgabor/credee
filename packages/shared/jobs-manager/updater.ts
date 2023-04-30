import { useRedditUpdater } from '../reddit/queue.js'
import { redisConnection } from './client.js'

const MINUTE = 1000 * 60

const { queue: updater, queueEvents } = useRedditUpdater({ redisConnection })

export async function getUpdaterJob() {
  const jobs = await updater.getRepeatableJobs()
  const lastTenJobs = await updater.getCompleted(0, 10)

  const running = await updater.getActive()

  const allLogs = await Promise.all([...running, ...lastTenJobs].map(job => updater.getJobLogs(job.id)))

  return {
    job: jobs.find(j => j.id === 'reddit-updater'),
    logs: allLogs,
    isRunning: !!running.length,
  }
}

export async function setUpdaterJob(repeatMinutes = 60) {
  const job = await getUpdaterJob()
  await updater.removeRepeatableByKey(job.job.key)

  await updater.add('reddit-updater', null, {
    jobId: 'reddit-updater',
    repeatJobKey: 'reddit-updater',
    repeat: {
      every: repeatMinutes * MINUTE,
    },
    keepLogs: 999,
  })
}
