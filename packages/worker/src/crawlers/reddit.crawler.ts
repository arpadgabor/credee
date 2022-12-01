import playwright from 'playwright'
import type { RedditCrawledPost, RedditCrawlerOptions } from './reddit.crawler.types.js'
import { createSubredditSpider } from './spiders/subreddit/index.js'

let browser: playwright.Browser | null = null
export async function crawlReddit(options: RedditCrawlerOptions) {
  browser =
    browser ??
    (await playwright.chromium.launch({
      headless: true,
      args: ['--blink-settings=mainFrameClipsContent=false'],
    }))

  const subredditSpider = createSubredditSpider({
    subreddit: options.subreddit,
    page: await browser.newPage({
      viewport: { height: 800, width: 1600 },
    }),
  })
  await subredditSpider.preparePage([
    `//button[contains(., 'Accept all')]`,
    `[href="${options.subreddit}/new/"][role="button"]`,
  ])

  let stop: Function
  const startTime = Date.now()
  const collection = new Map<string, RedditCrawledPost>()

  subredditSpider.onData(async data => {
    const now = Date.now()
    const elapsed = (now - startTime) / 1000

    if ('count' in options.endAfter && collection.size >= options.endAfter.count) {
      const posts = Array.from(collection.values())
      const readyPosts = posts.filter(item => item.id && item.screenshot)
      if (readyPosts.length === options.endAfter.count) {
        stop()
        return
      }
    }

    if ('seconds' in options.endAfter && elapsed >= options.endAfter.seconds) {
      stop()
      return
    }

    if ('screenshot' in data) {
      const post = collection.get(data.post.id) ?? ({} as RedditCrawledPost)
      collection.set(data.post.id, { ...post, screenshot: data.screenshot })
      return
    }

    if ('comments' in data) {
      const { post, comments } = data

      const isSelfPost = post.media.type === 'rtjson'
      const isCrossPost = !!post.crosspostParentId
      const isVideo = ['Vimeo', 'YouTube', 'Gfycat'].includes(post.media?.provider)
      const isImage = post.media.type === 'image'
      const isLink = !(isSelfPost || isCrossPost || isVideo || isImage)

      const result = {
        id: post.id,
        createdAt: new Date(post.created).toISOString(),

        title: post.title,
        subreddit: options.subreddit,
        author: post.author,
        permalink: post.permalink,

        score: post.score,
        ration: post.upvoteRatio,
        goldCount: post.goldCount,

        domain: post.domain,
        url: post.source?.url,
        urlTitle: post.source?.displayText,

        isOriginalContent: post.isOriginalContent,
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
      }

      const existingPost = collection.get(post.id) ?? ({} as RedditCrawledPost)
      collection.set(post.id, { ...existingPost, ...result })
      return
    }
  })

  await subredditSpider.crawl()
  await new Promise(resolve => {
    stop = resolve
  })

  await subredditSpider.stop()
  await browser?.close()
  browser = null

  return Array.from(collection.values()).filter(post => post.id && post.screenshot)
}

async function cleanup() {
  console.log('Closing browser...')
  await browser?.close()
  process.exit(1)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
