import { useRedditUpdater } from '@credee/shared/reddit/queue'
import { redisConnection } from './redis.js'
import { worker as redditUpdater } from './queues/reddit-updater.js'
import { worker as redditWorker } from './queues/reddit-crawler.js'

redditWorker.run()
redditWorker.on('ready', () => console.log('Reddit worker ready.'))
redditWorker.on('error', error => {
  console.log(error)
})

redditUpdater.run()
redditUpdater.on('ready', async () => {
  const MINUTE = 1000 * 60
  const HOUR = 60 * MINUTE
  useRedditUpdater({ redisConnection }).queue.add('reddit-updater', null, {
    jobId: 'reddit-updater',
    repeat: {
      every: 1 * HOUR,
    },
  })
  console.log('Reddit updater ready.')
})
redditUpdater.on('error', error => {
  console.log(error)
})
