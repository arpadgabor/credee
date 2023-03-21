import type { RedditCrawlerOptions } from '@credee/shared/reddit/types'
import { browser } from '../../utils/browser.js'
import { uploadFile } from '../../utils/file-upload.js'
import { sentiment } from '../../utils/sentiment.js'
import { createSubredditCrawler } from './create-subreddit-spider.js'
import { getPost, parsePost, savePost } from './post-actions.js'

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
    try {
      if (await getPost(post.id)) {
        console.log(`Post ${post.id} already scraped.`)
        return
      }

      const { awards, comments: comms, isCrossPost, isImage, isLink, isSelfPost, isVideo } = parsePost({ post, comments })

      const filename = `${post.id}_${Date.now()}.png`
      const screenshotPath = await uploadFile({ filename, data: screenshot }).catch(error => {
        console.log(error)
        throw error
      })

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
    } catch (error) {
      console.log('Errored in reddit scraper', error)
    }
  })

  await subredditSpider.crawl()
  subredditSpider.removeAllListeners('post-data')

  await context?.close()
}
