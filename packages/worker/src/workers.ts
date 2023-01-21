import { worker as redditWorker } from './queues/reddit-crawler.js'

redditWorker.run()

redditWorker.on('ready', () => console.log('Reddit worker ready.'))
redditWorker.on('error', error => {
  console.log(error)
})
