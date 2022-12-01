import { createCrawlQueue } from '@credee/worker'
import { config } from 'src/config.js'

const { sendCrawlInput, outputQueue } = createCrawlQueue(config.get('redisUrl'))

outputQueue.process((job, done) => {
  console.log(job.data)
  done()
})

export { sendCrawlInput }
