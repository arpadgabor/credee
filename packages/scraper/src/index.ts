import { promises as fs } from 'fs'
import { join } from 'path'
import playwright from 'playwright'
import { createSubredditSpider } from './spiders/subreddit/index.js'

/**
 * TODO: Add flairs
 * TODO: Add historical data for: awards, comments, upvotes, ratio
 * e.g.
 * userReactionHistory: Array<{
 *   date: Date
 *   score: number
 *   upvoteRatio: number
 *   comments: number
 *   awardNumber: number
 *   awards: Award[]
 * }>
 */

const SUBREDDIT = '/r/apple'

const SECONDS = 1000
const MINUTES = 60 * SECONDS
// const CRAWL_TIME = 5 * MINUTES
const CRAWL_TIME = 10 * SECONDS

const JSON_LOCATION = join(process.cwd(), 'data', 'json')
const SCREENSHOTS_LOCATION = join(process.cwd(), 'data', 'screenshots')

let browser: playwright.Browser

async function main() {
  browser = await playwright.chromium.launch({
    headless: false,
    args: ['--blink-settings=mainFrameClipsContent=false'],
  })
  const page = await browser.newPage()
  const subredditSpider = createSubredditSpider({ page, subreddit: SUBREDDIT })
  await subredditSpider.preparePage([`//button[contains(., 'Accept all')]`, `[href="${SUBREDDIT}/new/"][role="button"]`])

  const startTime = Date.now()
  let prevIterationTime = Date.now()

  let total = 0
  const collection: any[] = []
  subredditSpider.onData(async data => {
    if ('screenshot' in data) {
      await fs.writeFile(join(SCREENSHOTS_LOCATION, `${data.post.id}.png`), data.screenshot)
      return
    } else {
      const { post, comments } = data

      const isSelfPost = post.media.type === 'rtjson'
      const isCrossPost = !!post.crosspostParentId
      const isVideo = ['Vimeo', 'YouTube', 'Gfycat'].includes(post.media?.provider)
      const isImage = post.media.type === 'image'
      const isLink = !(isSelfPost || isCrossPost || isVideo || isImage)

      collection.push({
        id: post.id,
        createdAt: new Date(post.created).toISOString(),
        title: post.title,
        score: post.score,
        ration: post.upvoteRatio,
        subreddit: SUBREDDIT,
        author: post.author,
        permalink: post.permalink,
        url: post.source?.url,
        urlTitle: post.source?.displayText,
        domain: post.domain,
        isSelfPost,
        isCrossPost,
        isVideo,
        isImage,
        isLink,
        media: post.media,
        nrOfComments: post.numComments,
        comments: comments
          .filter(com => !(com.isAdmin || com.isMod))
          .map(com => ({
            id: com.id,
            author: com.author,
            content: com.media.richtextContent,
            createdAt: new Date(com.created).toISOString(),
            editedAt: com.editedAt ? new Date(com.editedAt).toISOString() : null,
            gildings: com.gildings,
            goldCount: com.goldCount,
            permalink: com.permalink,
            score: com.score,
            voteState: com.voteState,
          })),
        awards: post.allAwardings?.map(award => ({
          id: award.id,
          name: award.name,
          count: award.count,
          description: award.description,
          icon: award.iconUrl,
        })),
      })

      const duration = Date.now() - prevIterationTime
      prevIterationTime = Date.now()
      const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)

      total++
      console.log(`Saved ${total} posts! [+${duration}ms] [Elapsed: ${elapsed} seconds]`)
    }
  })
  await subredditSpider.crawl()

  await new Promise(async resolve => {
    setTimeout(() => {
      resolve(null)
    }, CRAWL_TIME)
  })

  const filename = SUBREDDIT.replace('/r/', '')
  await fs.writeFile(join(JSON_LOCATION, `${filename}.json`), JSON.stringify(collection, null, 2))

  await subredditSpider.stop()

  const embedProviders = [...new Set(collection.map(item => item.media?.provider || []))].flat()
  embedProviders.length && console.log({ embedProviders })

  await browser.close()
}
main()

async function cleanup() {
  console.log('Closing browser...')
  await browser.close()
  process.exit(1)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
