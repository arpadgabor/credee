import { useRedditCrawler, useRedditUpdater } from '@credee/shared/reddit/queue'
import { config } from '../../../config.js'

const redisConnection = {
  host: config.get('redis.host'),
  port: config.get('redis.port'),
}
const RedditCrawler = useRedditCrawler({ redisConnection })
const RedditUpdater = useRedditUpdater({ redisConnection })

export { RedditCrawler, RedditUpdater }
