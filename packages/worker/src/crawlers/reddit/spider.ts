import { EventEmitter } from 'node:events'
import playwright from 'playwright'
import type { Post, Comment } from '@credee/shared/reddit/types.js'
import type { EmittedEvents, SubredditSpiderInit } from './util.js'

export function createSubredditSpider({ page: _page, subreddit: _subreddit, limit }: SubredditSpiderInit) {
  const baseUrl = 'https://reddit.com'
  const queue: Map<string, { post: Post; comments?: Comment[] }> = new Map()
  const page: playwright.Page = _page
  const subreddit = _subreddit

  let crawling = true
  let resolveTask: Function
  let remainingEmptyLoops = 25
  let count = 0

  const eventQueue = new EventEmitter()

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
    page.on('response', interceptor)

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

  /** Intercepts get requests from reddit's API */
  async function interceptor(response: playwright.Response) {
    if (!crawling) return

    const url = response.url()
    if (!url.includes('gateway.reddit.com')) return

    // handle post with comments
    if (url.includes('postcomments')) {
      const data = await response.json().catch(error => {
        console.info('This error should be fine, the browser is closing.')
        console.info(error)

        return {}
      })

      if (!('comments' in data)) return

      const [post]: Post[] = Object.values(data.posts)
      const comments: Comment[] = Object.values(data.comments)

      eventQueue.emit('post-data', { post, comments })
      ++count
      if (count === limit) {
        crawling = false
      }
      return
    }

    // handle subreddit posts
    if (url.includes('subreddits')) {
      const data = await response.json().catch(error => {
        console.log(error)
        return {}
      })

      if (!('posts' in data)) return

      const posts: Post[] = Object.values(data.posts)
      posts.forEach(post => {
        if (post.isSurveyAd || post.isCreatedFromAdsUi || post.isSponsored) return

        queue.set(post.id, { post })
        return
      })
    }
  }

  async function scrape(postId: string, post: Post) {
    const elems = await page.$$(`[id="${post.postId}"]`)

    if (elems.length !== 1) {
      // Probably a cross-post.
      // This might be because this is the ID of the original post in a crosspost.
      queue.delete(postId)
      return
    }

    // wait until the post is loaded and scroll to it for screenshot
    const postElement = await page.waitForSelector(`[id="${postId}"]`)
    await postElement.scrollIntoViewIfNeeded()
    const screenshot = await postElement.screenshot({ type: 'png' })

    // open post
    // wait until it's loaded, then interceptor is called with the data from the post's comments
    await postElement.click()
    await page.waitForSelector(`[id="overlayScrollContainer"]`)
    // close the post
    await page.mouse.click(5, 200, { delay: 250 })

    eventQueue.emit('screenshot', { screenshot, post })
    queue.delete(postId)
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

    for await (const [id, { post }] of queue) {
      if (!crawling) {
        resolveTask?.()
        return
      }

      await scrape(id, post)
    }

    remainingEmptyLoops = 25
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
