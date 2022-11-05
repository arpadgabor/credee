import playwright from 'playwright'
import { Post } from 'types/reddit-sub'

interface ScrapedPost {
  id: string
  title: string
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
      const postElement = await page.waitForSelector(`[id="${id}"]`, { timeout: 0 })
      await postElement.scrollIntoViewIfNeeded()
      const screenshot = await postElement.screenshot()

      await onDataCallback?.({
        id: post.id,
        screenshot,
        title: post.title,
      })

      queue.delete(id)
    }

    if (crawling) setTimeout(crawler, 100)
    else resolveTask?.()
  }

  async function crawl() {
    task = new Promise(async resolve => {
      resolveTask = resolve
      await crawler()
    })
  }

  async function stop() {
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
