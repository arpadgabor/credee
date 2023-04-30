import { useRedditUpdater } from '@credee/shared/reddit/queue'
import { Worker } from 'bullmq'
import { updatePostData } from '../crawlers/reddit/update-post-data.js'
import { redisConnection } from '../redis.js'
import { browser } from '../utils/browser.js'

const { queueName, queue } = useRedditUpdater({
  redisConnection,
})

export const worker = new Worker(
  queueName,
  async job => {
    await job.log(`Started! [${new Date().toISOString()}]`)
    const start = Date.now()
    const context = await browser.newContext({
      viewport: { height: 1400, width: 1920 },
    })

    await updatePostData(context, job).catch(async e => {
      console.log(e)
      await job.log(`Error! ${e.message || e}`)
    })

    const end = Date.now()
    const takenSeconds = ((end - start) / 1000).toFixed(2)
    await job.log(`Done in ${takenSeconds}s! [${new Date().toISOString()}]`)
    await context.close()
  },
  { autorun: false, connection: redisConnection }
)
