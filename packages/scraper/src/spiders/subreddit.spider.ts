import playwright from 'playwright'
import { Post } from 'types/reddit-sub'

interface ScrapedPost {
  post: Post
  screenshot: Buffer
}

interface SubredditSpiderInit {
  page: playwright.Page
  /**
   * @example '/r/Android'
   */
  subreddit: `/r/${string}`
}

export function createSubredditSpider({ page: _page, subreddit: _subreddit }: SubredditSpiderInit) {
  const baseUrl = 'https://reddit.com'
  const queue: Map<string, Post> = new Map()
  const page: playwright.Page = _page
  const subreddit = _subreddit
  let crawling = true
  let task: Promise<any>
  let resolveTask: Function

  let onDataCallback: (data: ScrapedPost) => PromiseLike<void>

  async function interceptor(response: playwright.Response) {
    const url = response.url()
    if (!url.includes('gateway.reddit.com')) return

    const data = await response.json()
    if (!('posts' in data)) return

    const posts: Post[] = Object.values(data.posts)
    posts.forEach(post => {
      if (post.isSurveyAd || post.isCreatedFromAdsUi || post.isSponsored) return

      queue.set(post.id, post)
    })
  }

  function onData(cb: (data: ScrapedPost) => PromiseLike<void>) {
    onDataCallback = cb
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
    for await (const [id, post] of queue) {
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

      await page.evaluate(() => {
        const els = document.querySelectorAll('.subredditvars-r-science')
        els.forEach(popup => {
          if (popup.children?.[0]?.id === 'AppRouter-main-content') return
          popup.remove()
        })
      })

      const screenshot = await postElement.screenshot()

      await onDataCallback({
        post,
        screenshot,
      })

      queue.delete(id)
    }

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
  }

  return {
    preparePage,
    onData,
    crawl,
    stop,
  }
}
