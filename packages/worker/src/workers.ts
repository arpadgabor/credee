import { worker as redditUpdater } from './queues/reddit-updater.js'
import { worker as redditWorker } from './queues/reddit-crawler.js'

redditWorker.run()
redditWorker.on('ready', () => console.log('Reddit worker ready.'))
redditWorker.on('error', error => {
  console.log(error)
})

redditUpdater.run()
redditUpdater.on('ready', async () => {
  console.log('Reddit updater ready.')
})
redditUpdater.on('error', error => {
  console.log(error)
})
