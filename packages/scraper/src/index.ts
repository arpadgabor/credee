import { promises as fs } from 'fs'
import { join } from 'path'
import playwright from 'playwright'
import { Edge, RedditHomeResponse } from 'types/reddit-home'
import { createSubredditSpider } from './spiders/subreddit.spider.js'

let browser: playwright.Browser
const edges: Edge[] = []

async function cleanup() {
  console.log('Closing browser...')
  await browser.close()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

//     .map(({ node }) => ({
//       id: node.id,
//       title: node.title,
//       author: node.authorInfo?.name,
//       subreddit: node.subreddit?.prefixedName,
//       score: node.score,
//       upvoteRatio: node.upvoteRatio,
//       url: node.url,
//       domain: node.domain,
//       createdAt: node.createdAt,
//       isNsfw: node.isNsfw,
//       isOriginalContent: node.isOriginalContent,
//       isSelfPost: node.isSelfPost,
//       permalink: node.permalink,

async function main() {
  browser = await playwright.chromium.launch({
    headless: false,
    timeout: 5000,
    args: ['--blink-settings=mainFrameClipsContent=false'],
  })
  const page = await browser.newPage()

  const subreddit = '/r/Android'
  const subredditSpider = createSubredditSpider({
    page,
    subreddit,
  })

  const baseFilesPath = join(process.cwd(), 'data', 'files')
  subredditSpider.onData(async data => {
    await fs.writeFile(join(baseFilesPath, `${data.id}.png`), data.screenshot)
    console.log('Got data!', data)
  })

  await subredditSpider.preparePage([`[href="${subreddit}/new/"][role="button"]`])
  await subredditSpider.crawl()

  await new Promise(async resolve => {
    setTimeout(() => {
      resolve(null)
    }, 10000)
  })

  await subredditSpider.stop()

  await browser.close()
}

main()
