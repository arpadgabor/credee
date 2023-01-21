import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import playwright from 'playwright'
import { createSubredditSpider } from './spider.js'
import type { RedditCrawledPost, RedditCrawlerOptions } from '@credee/shared/reddit/types.js'

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
    limit: options.endAfter.count || 5,
  })
  await subredditSpider.prepare([`//button[contains(., 'Accept all')]`, `[href="${options.subreddit}/new/"][role="button"]`])
  const collection = new Map<string, RedditCrawledPost>()

  const isPostDone = (id: string) => collection.get(id)?.title && collection.get(id)?.screenshotPath

  subredditSpider.on('post-data', async ({ post, comments }) => {
    const isSelfPost = post.media.type === 'rtjson'
    const isCrossPost = !!post.crosspostParentId
    const isVideo = ['Vimeo', 'YouTube', 'Gfycat'].includes(post.media?.provider)
    const isImage = post.media.type === 'image'
    const isLink = !(isSelfPost || isCrossPost || isVideo || isImage)

    const result: RedditCrawledPost = {
      id: post.id,
      createdAt: new Date(post.created).toISOString(),

      title: post.title,
      subreddit: options.subreddit,
      author: post.author,
      permalink: post.permalink,

      score: post.score,
      ratio: post.upvoteRatio,
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

    if (isPostDone(post.id)) {
      options.notifications?.emit('progress', {
        post: collection.get(post.id),
        progress: collection.size / options.endAfter.count,
      })
    }
  })

  subredditSpider.on('screenshot', async data => {
    const post = collection.get(data.post.id) ?? ({} as RedditCrawledPost)
    const screenshotPath = `${data.post.id}_${Date.now()}.png`
    await fs.writeFile(resolve(process.cwd(), 'screenshots', screenshotPath), data.screenshot)

    collection.set(data.post.id, {
      ...post,
      screenshotPath,
    })
  })

  await subredditSpider.crawl()
  await browser?.close()
  browser = null

  return Array.from(collection.values()).filter(post => post.id && post.screenshotPath)
}

async function cleanup() {
  console.log('Closing browser...')
  await browser?.close()
  process.exit(1)
}

process.on('SIGINT', cleanup)
process.on('SIGTERM', cleanup)
