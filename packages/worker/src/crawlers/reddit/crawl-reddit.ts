import type { Comment, Post, RedditCrawledPost, RedditCrawlerOptions } from '@credee/shared/reddit/types'
import { browser } from '../../utils/browser.js'
import { uploadFile } from '../../utils/file-upload.js'
import { createSubredditCrawler } from './create-subreddit-spider.js'
import { savePost } from './save-post.js'

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

  async function handlePostData({ post, comments, screenshot }: { post: Post; comments: Comment[]; screenshot: Buffer }) {
    const isSelfPost = post.media.type === 'rtjson'
    const isCrossPost = !!post.crosspostParentId
    const isVideo = ['Vimeo', 'YouTube', 'Gfycat'].includes(post.media?.provider)
    const isImage = post.media.type === 'image'
    const isLink = !(isSelfPost || isCrossPost || isVideo || isImage)

    const screenshotPath = `${post.id}_${Date.now()}.png`
    const uploadPath = await uploadFile({ filename: screenshotPath, data: screenshot }).catch(error => {
      console.log(error)
      throw error
    })

    await savePost({
      id: post.id,
      createdAt: new Date(post.created).toISOString(),
      screenshotPath: uploadPath,

      title: post.title,
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
    })
  }

  subredditSpider.on('post-data', handlePostData)

  await subredditSpider.crawl()
  await context?.close()

  subredditSpider.off('post-data', handlePostData)
}
