import got from 'got'
import { sentiment } from '../../utils/sentiment.js'
import { Page } from 'playwright'
import { Comment, Post } from '@credee/shared/reddit/types'
import { parsePost, savePost } from './post-actions.js'
import { uploadFile } from '../../utils/file-upload.js'
import { Job } from 'bullmq'

export async function crawlPostPage(page: Page, postId: string, subreddit: string, job?: Job) {
  let sub = subreddit.startsWith('/') ? subreddit : `/r/${subreddit}`

  const [response] = await Promise.all([
    await got(`https://gateway.reddit.com/desktopapi/v1/postcomments/${postId}`).json<any>(),
    page.goto(`https://reddit.com${sub}/comments/${postId.replace('t3_', '')}`, { waitUntil: 'domcontentloaded' }),
  ])

  await page
    .$$eval('[bundlename="reddit_cookie_banner"]', p => {
      p.forEach(e => e.remove())
    })
    .catch(() => console.log('No cookie banner found.'))

  await page
    .$eval('reddit-header-large', p => {
      p.remove()
    })
    .catch(() => console.log('No header found.'))

  const [postData]: Post[] = Object.values(response.posts)
  const comments: Comment[] = Object.values(response.comments)

  const expandedPost = await page.$(`#${postId}`)
  const isDeleted = (await page.getByText('this post has been removed').count()) > 0

  if (isDeleted) {
    await job?.log?.(`Post ${postId} was deleted.`)
    console.log('Post was deleted.')
    return
  }

  const screenshot = await expandedPost.screenshot({ type: 'png', timeout: 5000 }).catch(() => null)
  if (!screenshot) {
    await job.log(`Could not screenshot post ${postId}`)
    return
  }

  const { awards, comments: comms, isCrossPost, isImage, isLink, isSelfPost, isVideo } = parsePost({ post: postData, comments })

  const filename = `${postId}_${Date.now()}.png`
  const screenshotPath = await uploadFile({ filename, data: screenshot }).catch(error => {
    console.log(error)
    throw error
  })

  return savePost({
    id: postData.postId,
    createdAt: new Date(postData.created).toISOString(),
    screenshotPath,

    title: postData.title,
    titleSentiment: sentiment(postData.title),

    subreddit: subreddit,
    author: postData.author,
    permalink: postData.permalink,
    flair: postData?.flair?.[0]?.text,

    score: postData.score,
    ratio: postData.upvoteRatio,
    goldCount: postData.goldCount,

    domain: postData.domain,
    url: postData.source?.url,
    urlTitle: postData.source?.displayText,

    isOriginalContent: postData.isOriginalContent,
    isSelfPost,
    isCrossPost,
    isVideo,
    isImage,
    isLink,

    media: postData.media,

    nrOfComments: postData.numComments,
    comments: comms,
    awards,
  })
}
