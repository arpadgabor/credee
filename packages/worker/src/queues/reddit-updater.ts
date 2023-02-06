import { useRedditUpdater } from '@credee/shared/reddit/queue'
import { Worker } from 'bullmq'
import { updatePostData } from '../crawlers/reddit/update-post-data.js'
import { redisConnection } from '../redis.js'
import { browser } from '../utils/browser.js'

const { queueName } = useRedditUpdater({
  redisConnection,
})

export const worker = new Worker<{ postId: string }>(
  queueName,
  async job => {
    await updatePostData(job.data.postId, browser).catch(e => {
      console.log(e)
      throw e
    })
  },
  { autorun: false, connection: redisConnection }
)
