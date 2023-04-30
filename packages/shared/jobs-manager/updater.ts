import { UpdaterOptions, useRedditUpdater } from '../reddit/queue.js'
import { redis, redisConnection } from './client.js'

const MINUTE = 1000 * 60

const { queue: updater } = useRedditUpdater({ redisConnection })

export async function getUpdaterJob() {
  const [job] = await updater.getRepeatableJobs()

  const options = await redis.json.get('reddit-updater:options')

  const lastTenJobs = await updater.getCompleted(0, 10)
  const lastTenFailed = await updater.getFailed(0, 10)
  const running = await updater.getActive()

  const all = [...lastTenJobs, ...lastTenFailed, ...running].sort((a, b) => b.timestamp - a.timestamp)

  const allLogs = await Promise.all(all.map(job => updater.getJobLogs(job.id)))

  return {
    job: {
      ...job,
      options: options as UpdaterOptions,
    },
    logs: allLogs,
    isRunning: !!running.length,
  }
}

export async function setUpdaterJob(options: UpdaterOptions = { repeatMinutes: 60, maxDays: 3, maxScrapes: 36 }) {
  const job = await getUpdaterJob()
  await updater.removeRepeatableByKey(job.job.key)

  await updater.add('reddit-updater', options, {
    jobId: 'reddit-updater',
    repeatJobKey: 'reddit-updater',
    repeat: {
      every: options.repeatMinutes * MINUTE,
    },
    keepLogs: 999,
  })
  await redis.json.set('reddit-updater:options', '$', options as any)
}
