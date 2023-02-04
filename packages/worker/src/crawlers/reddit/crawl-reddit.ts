import type { Comment, Post, RedditCrawledPost, RedditCrawlerOptions } from '@credee/shared/reddit/types'
import { browser } from '../../utils/browser.js'
import { uploadFile } from '../../utils/file-upload.js'
import { sentiment } from '../../utils/sentiment.js'
import { createSubredditCrawler } from './create-subreddit-spider.js'
import { savePost } from './save-post.js'

export async function crawlReddit(options: RedditCrawlerOptions) {
  const context = await browser.newContext({
    viewport: { height: 800, width: 1600 },
  })

  const subredditSpider = createSubredditCrawler({
    subreddit: options.subreddit,
    page: await context.newPage(),
    limit: options.count || 5,
  })

  await subredditSpider.prepare([`//button[contains(., 'Accept all')]`, `[href="${options.subreddit}/new/"][role="button"]`])

  subredditSpider.on('post-data', async ({ post, comments, screenshot }) => {
    const isSelfPost = post.media.type === 'rtjson'
    const isCrossPost = !!post.crosspostParentId
    const isVideo = ['Vimeo', 'YouTube', 'Gfycat'].includes(post.media?.provider)
    const isImage = post.media.type === 'image'
    const isLink = !(isSelfPost || isCrossPost || isVideo || isImage)

    const comms = comments
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
      }))

    const awards = post.allAwardings?.map(award => ({
      id: award.id,
      name: award.name,
      count: award.count,
      description: award.description,
      icon: award.iconUrl,
    }))

    const filename = `${post.id}_${Date.now()}.png`
    const screenshotPath = await uploadFile({ filename, data: screenshot }).catch(error => {
      console.log(error)
      throw error
    })

    console.log(sentiment(post.title))

    await savePost({
      id: post.id,
      createdAt: new Date(post.created).toISOString(),
      screenshotPath,

      title: post.title,
      titleSentiment: sentiment(post.title),

      subreddit: options.subreddit,
      author: post.author,
      permalink: post.permalink,
      flair: post?.flair?.[0]?.text,

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
      comments: comms,
      awards,
    })
  })

  await subredditSpider.crawl()
  subredditSpider.removeAllListeners('post-data')

  await context?.close()
}
