import { worker as redditWorker } from './queues/reddit-crawler.js'
import { worker as redditUpdater } from './queues/reddit-updater.js'

redditWorker.run()
redditWorker.on('ready', () => console.log('Reddit worker ready.'))
redditWorker.on('error', error => {
  console.log(error)
})

redditUpdater.run()
redditUpdater.on('ready', () => console.log('Reddit updater ready.'))
redditUpdater.on('error', error => {
  console.log(error)
})
