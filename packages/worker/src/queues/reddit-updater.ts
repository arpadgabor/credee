import { useRedditUpdater } from '@credee/shared/reddit/queue'
import { Worker } from 'bullmq'
import { updatePostData } from '../crawlers/reddit/update-post-data.js'
import { redisConnection } from '../redis.js'
import { browser } from '../utils/browser.js'

const { queueName, queue } = useRedditUpdater({
  redisConnection,
})

export const worker = new Worker<{ postId: string }>(
  queueName,
  async job => {
    await job.log(`[${new Date().toISOString()}]`)
    const context = await browser.newContext({
      viewport: { height: 1400, width: 1920 },
    })

    await updatePostData(context, job).catch(async e => {
      console.log(e)
      await job.log(`Error! ${e.message || e}`)
    })

    await context.close()
  },
  { autorun: false, connection: redisConnection }
)
