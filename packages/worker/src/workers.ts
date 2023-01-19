import { worker } from './queues/reddit-crawler/worker.js'

worker.run()
worker.on('ready', () => console.log('Reddit worker ready.'))
worker.on('error', error => {
  console.log(error)
})
