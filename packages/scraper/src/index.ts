import { promises as fs } from 'fs'
import { join } from 'path'
import playwright from 'playwright'
import { Edge, RedditHomeResponse } from 'types/reddit-home'

let browser: playwright.Browser
const edges: Edge[] = []

async function cleanup() {
  console.log('Closing browser...')
  await browser.close()
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)

async function initializeRedditPage(page: playwright.Page) {
  await page.goto('https://reddit.com')
  const home = await page.waitForSelector('[href="/"]')

  home.click()

  await page.waitForTimeout(2000)
}

async function startScrolling(page: playwright.Page, scrolls = 50) {
  const scrollLength = 1000

  for (let idx = 0; idx < scrolls; idx++) {
    console.log(`[${idx}] Scrolling...`)

    await page.mouse.wheel(0, scrollLength)
    await page.waitForTimeout(500)
  }
}

async function interceptResponse(response: playwright.Response) {
  const url = response.url()
  if (!url.includes('gql.reddit.com')) return

  const json: { data: RedditHomeResponse } = await response.json()
  if (!json?.data?.home) return

  const elements = json?.data?.home?.elements?.edges

  edges.push(...elements)

  console.log(`Got ${elements.length} edges.`)
}

async function main() {
  browser = await playwright.chromium.launch({
    headless: false,
  })
  const page = await browser.newPage()

  page.on('response', interceptResponse)

  await initializeRedditPage(page)
  await startScrolling(page)

  const posts = edges
    .filter(edge => !!edge.node.authorInfo)
    .map(({ node }) => ({
      id: node.id,
      title: node.title,
      author: node.authorInfo?.name,
      subreddit: node.subreddit?.prefixedName,
      score: node.score,
      upvoteRatio: node.upvoteRatio,
      url: node.url,
      domain: node.domain,
      createdAt: node.createdAt,
      isNsfw: node.isNsfw,
      isOriginalContent: node.isOriginalContent,
      isSelfPost: node.isSelfPost,
      permalink: node.permalink,
    }))

  const postsJsonPath = join(process.cwd(), 'data', 'posts.json')
  fs.writeFile(postsJsonPath, JSON.stringify(posts, null, 2))

  await browser.close()
}

main()
