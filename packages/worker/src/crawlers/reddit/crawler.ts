import { EventEmitter } from 'node:events'
import playwright, { Response } from 'playwright'
import type { Post, Comment } from '@credee/shared/reddit/types.js'
import type { EmittedEvents, SubredditSpiderInit } from './util.js'
import { nullable } from 'zod'

export function createSubredditCrawler({ page: _page, subreddit: _subreddit, limit }: SubredditSpiderInit) {
  const baseUrl = 'https://reddit.com'
  const queue: Map<string, { post: Post; comments?: Comment[] }> = new Map()
  const page: playwright.Page = _page
  const subreddit = _subreddit

  let crawling = true
  let resolveTask: Function
  let remainingEmptyLoops = 5
  let count = 0

  const eventQueue = new EventEmitter()

  //#region prepare page
  async function interceptPostsList() {
    page.on('response', async response => {
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
   */
  async function prepare(selectors: (string | ((page: playwright.Page) => Promise<void>))[] = []): Promise<void> {
    await page.goto(`${baseUrl}${subreddit}`)
    await interceptPostsList()

    for await (const selector of selectors) {
      if (typeof selector === 'string') {
        const selection = await page.waitForSelector(selector)
        await selection.click()
      }

      if (typeof selector === 'function') {
        await selector(page)
      }
    }
  }
  //#endregion

  async function awaitPostData() {
    return await new Promise<{ post: Post; comments: Comment[] }>(async (resolve, reject) => {
      let done = false
      async function intercept(response: Response) {
        const url = response.url()
        if (!url.includes('gateway.reddit.com')) return
        if (!url.includes('postcomments')) return
        // handle post with comments
        const data = await response.json()

        if (!('comments' in data)) return reject(new Error('No comments were found.'))

        const [post]: Post[] = Object.values(data.posts)
        const comments: Comment[] = Object.values(data.comments)

        page.off('response', intercept)
        done = true
        resolve({ post, comments })
      }

      page.on('response', intercept)
      setTimeout(() => {
        if (!done) reject()
      }, 10 * 1000)
    })
  }

  async function scrape(postId: string) {
    console.info('-------------------------')
    console.info(`SCRAPE ${postId}: Started`)
    const elems = await page.$$(`[id="${postId}"]`).catch(e => [])

    if (elems.length !== 1) {
      // Probably a cross-post.
      // This might be because this is the ID of the original post in a crosspost.
      queue.delete(postId)
      return
    }

    // wait until the post is loaded and scroll to it for screenshot
    console.info(`SCRAPE ${postId}: Getting element`)
    const postElement = await page.waitForSelector(`[id="${postId}"]`, { timeout: 5000 }).catch(e => {
      console.error(e)
      return
    })

    if (!postElement) {
      console.info(`SCRAPE ${postId}: Didn't find element with title ${queue.get(postId).post.title}`)
      queue.delete(postId)
      return
    }

    console.info(`SCRAPE ${postId}: Scrolling into view`)
    await postElement.scrollIntoViewIfNeeded()
    // await page.mouse.wheel(0, 200)
    console.info(`SCRAPE ${postId}: Screenshotting`)
    const screenshot = await postElement.screenshot({ type: 'png' })

    // open post
    // wait until it's loaded, then interceptor is called with the data from the post's comments
    console.info(`SCRAPE ${postId}: Opening post`)
    postElement.click()
    console.info(`SCRAPE ${postId}: Waiting for data`)
    const { post, comments } = await awaitPostData().catch(() => ({ post: null, comments: null }))
    if (!post || !comments) {
      console.info(`SCRAPE ${postId}: No data for ${queue.get(postId).post.title}`)
      queue.delete(postId)
      await page.mouse.click(5, 200, { delay: 250 })
      return
    }

    // close the post
    console.info(`SCRAPE ${postId}: Closing post`)
    await page.mouse.click(5, 200, { delay: 250 })

    eventQueue.emit('post-data', { screenshot, post, comments })
    queue.delete(postId)

    count++
    if (count === limit) {
      crawling = false
    }
  }

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
  }
}
