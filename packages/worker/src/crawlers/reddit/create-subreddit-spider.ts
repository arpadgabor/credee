import { EventEmitter } from 'node:events'
import playwright, { Response } from 'playwright'
import type { Post, Comment } from '@credee/shared/reddit/types'
import type { EmittedEvents, SubredditSpiderInit } from './util.js'
import { crawlPostPage } from './crawl-post-page.js'

export function createSubredditCrawler({
  feedPage: _feedPage,
  postPage: _postPage,
  subreddit: _subreddit,
  limit,
  job,
}: SubredditSpiderInit) {
  const baseUrl = 'https://reddit.com'
  const queue: Map<string, { post: Post; comments?: Comment[] }> = new Map()
  const feedPage: playwright.Page = _feedPage
  const postPage: playwright.Page = _postPage
  const subreddit = _subreddit

  let crawling = true
  let resolveTask: Function
  let remainingEmptyLoops = 5
  let count = 0

  const eventQueue = new EventEmitter()

  //#region prepare page
  /** @private */
  async function interceptPostsList() {
    feedPage.on('response', async response => {
      const url = response.url()
      if (!url.includes('.reddit.com')) return

      const isJson = (await response.headerValue('content-type'))?.includes('json')
      if (!isJson) return

      const json = await response.json().catch(() => null)
      if (!json) return

      const posts: Post[] = json?.posts
        ? Object.values(json?.posts)
        : json?.data?.subredditInfoByName?.elements?.edges?.map(edge => edge?.node)

      if (!posts) return
      if (posts.length === 1) return

      posts
        .filter(post => !(post?.isSurveyAd || post?.isCreatedFromAdsUi || post?.isSponsored) && post?.title)
        .forEach(post => {
          if (queue.has(post.id)) {
            return
          }

          queue.set(post.id, { post })
          console.log('added to queue:', post.title)
        })
    })
  }

  /**
   * **Loads and prepares the page for crawling.**
   *
   * `string` selectors will trigger button clicks (e.g. for links) and
   * `function` selectors recieve the `page: playwright.Page` as argument for more complex requirements.
   *
   * @example
   * await preparePage([
   *   '[href="/"]',
   *   (page) => { ... }
   * ])
   * @public
   */
  async function prepare(selectors: (string | ((page: playwright.Page) => Promise<void>))[] = []): Promise<void> {
    await feedPage.goto(`${baseUrl}${subreddit}/top`)
    await interceptPostsList()

    for await (const selector of selectors) {
      if (typeof selector === 'string') {
        const selection = await feedPage.waitForSelector(selector)
        await selection.click()
      }

      if (typeof selector === 'function') {
        await selector(feedPage)
      }
    }
  }
  //#endregion

  /** @private */
  async function scrape(postId: string) {
    console.info('-------------------------')
    console.info(`SCRAPE ${count} ${postId}: Started`)
    const elems = await feedPage.$$(`#${postId}`).catch(e => [])

    console.log('Found post on page?', elems.length)

    if (elems.length !== 1) {
      // Probably a cross-post.
      // This might be because this is the ID of the original post in a crosspost.
      queue.delete(postId)
      return
    }

    console.info(`SCRAPE ${count} ${postId}: Scrolling into view`)
    await feedPage.mouse.wheel(0, 300)

    // open post
    // wait until it's loaded, then interceptor is called with the data from the post's comments
    console.info(`SCRAPE ${count} ${postId}: Opening post`)
    await crawlPostPage(postPage, postId, subreddit, job)

    console.info(`SCRAPE ${count} ${postId}: Closing post`)
    count++
    queue.delete(postId)

    if (count === limit) {
      setTimeout(() => {
        crawling = false
      })
    }
  }

  /** @private */
  async function crawler() {
    if (remainingEmptyLoops === 0) {
      resolveTask()
      return
    }

    if (queue.size === 0) {
      console.log('Queue is empty.')
      remainingEmptyLoops -= 1
      setTimeout(crawler, 1000)
      return
    }

    for await (const [id] of queue) {
      if (!crawling) {
        resolveTask?.()
        return
      }

      await scrape(id)
    }

    remainingEmptyLoops = 5
    if (crawling) setTimeout(crawler, 100)
  }

  /** @public */
  async function crawl() {
    await new Promise(async resolve => {
      resolveTask = resolve
      await crawler()
    })
  }

  return {
    prepare,
    crawl,
    on: <T extends keyof EmittedEvents>(key: T, cb: (data: EmittedEvents[T]) => any) => eventQueue.on(key, cb),
    removeAllListeners: eventQueue.removeAllListeners,
  }
}
