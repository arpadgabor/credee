import playwright from 'playwright'
import type { Post } from './subreddit.types.js'
import type { EmittedEvents, SubredditSpiderInit } from './util.js'
import type { Comment } from './comment.types.js'
import { EventEmitter } from 'events'

export function createSubredditSpider({ page: _page, subreddit: _subreddit }: SubredditSpiderInit) {
  const baseUrl = 'https://reddit.com'
  const queue: Map<string, { post: Post; comments?: Comment[] }> = new Map()
  const page: playwright.Page = _page
  const subreddit = _subreddit

  let crawling = true
  let task: Promise<any>
  let resolveTask: Function
  let remainingEmptyLoops = 25

  const eventQueue = new EventEmitter()

  async function interceptor(response: playwright.Response) {
    if (!crawling) return
    const url = response.url()
    if (!url.includes('gateway.reddit.com')) return

    // handle post with comments
    if (url.includes('postcomments')) {
      const data = await response.json().catch(error => {
        console.log(error)
        return {}
      })

      if (!('comments' in data)) return

      const [post]: Post[] = Object.values(data.posts)
      const comments: Comment[] = Object.values(data.comments)

      eventQueue.emit('post-data', { post, comments })

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
  async function preparePage(selectors: (string | ((page: playwright.Page) => Promise<void>))[] = []): Promise<void> {
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

  async function crawler() {
    if (remainingEmptyLoops === 0) {
      stop()
      return resolveTask()
    }

    if (queue.size === 0) {
      console.log('Queue is empty.')
      remainingEmptyLoops -= 1
      setTimeout(crawler, 500)
      return
    }

    for await (const [id, { post }] of queue) {
      if (!crawling) {
        return resolveTask()
      }

      const elems = await page.$$(`[id="${post.postId}"]`)

      if (elems.length !== 1) {
        console.log({
          message: `${post.id} has ${elems.length} matches. Skipping to not crash.`,
          reason: 'This might be because this is the ID of the original post in a crosspost.',
          id: id,
          postId: post.id,
          postTitle: post.title,
        })

        queue.delete(id)
        continue
      }

      const postElement = await page.waitForSelector(`[id="${id}"]`)
      await postElement.scrollIntoViewIfNeeded()

      const screenshot = await postElement.screenshot({ type: 'png' })

      await postElement.click()
      await page.waitForSelector(`[id="overlayScrollContainer"]`)
      await page.mouse.click(5, 200, { delay: 250 })

      eventQueue.emit('screenshot', { screenshot, post })
      queue.delete(id)
    }

    remainingEmptyLoops = 25
    if (crawling) setTimeout(crawler, 100)
  }

  async function crawl() {
    task = new Promise(async resolve => {
      resolveTask = resolve
      await crawler()
    })
  }

  async function stop() {
    console.log('Stopping task.')
    crawling = false
    await task
    eventQueue.emit('done')
  }

  return {
    preparePage,
    crawl,
    stop,
    on: <T extends keyof EmittedEvents>(key: T, cb: (data: EmittedEvents[T]) => any) => eventQueue.on(key, cb)
  }
}