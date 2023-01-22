import fs from 'node:fs/promises'
import { resolve } from 'node:path'
import { createSubredditCrawler } from './crawler.js'
import type { Comment, Post, RedditCrawledPost, RedditCrawlerOptions } from '@credee/shared/reddit/types.js'
import { browser } from '../browser.js'

export async function crawlReddit(options: RedditCrawlerOptions) {
  const context = await browser.newContext({
    viewport: { height: 800, width: 1600 },
  })

  const subredditSpider = createSubredditCrawler({
    subreddit: options.subreddit,
    page: await context.newPage(),
    limit: options.endAfter.count || 5,
  })

  await subredditSpider.prepare([`//button[contains(., 'Accept all')]`, `[href="${options.subreddit}/new/"][role="button"]`])
  const collection: RedditCrawledPost[] = []

  async function handlePostData({ post, comments, screenshot }: { post: Post; comments: Comment[]; screenshot: Buffer }) {
    const isSelfPost = post.media.type === 'rtjson'
    const isCrossPost = !!post.crosspostParentId
    const isVideo = ['Vimeo', 'YouTube', 'Gfycat'].includes(post.media?.provider)
    const isImage = post.media.type === 'image'
    const isLink = !(isSelfPost || isCrossPost || isVideo || isImage)

    const screenshotPath = `${post.id}_${Date.now()}.png`
    await fs.writeFile(resolve(process.cwd(), 'screenshots', screenshotPath), screenshot)

    const result: RedditCrawledPost = {
      id: post.id,
      createdAt: new Date(post.created).toISOString(),
      screenshotPath,

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

    collection.push(result)

    options.notifications?.emit('progress', {
      // post: collection.get(post.id),
      progress: collection.length,
    })
  }

  subredditSpider.on('post-data', handlePostData)

  await subredditSpider.crawl()
  await context?.close()

  subredditSpider.off('post-data', handlePostData)

  return Array.from(collection.values()).filter(post => post.id && post.screenshotPath)
}
