import { Comment, Post } from '@credee/shared/reddit/types'
import got from 'got'
import { Browser } from 'playwright'
import { uploadFile } from '../../utils/file-upload.js'
import { getPost, parsePost, savePost } from './post-actions.js'

export async function updatePostData(postId: string, browser: Browser) {
  console.log('Updating Post Data')
  const post = await getPost(postId)

  if (!post) return

  const context = await browser.newContext({
    viewport: { height: 800, width: 1600 },
  })
  const page = await context.newPage()
  const [response] = await Promise.all([
    await got(`https://gateway.reddit.com/desktopapi/v1/postcomments/${post.post_id}`).json<any>(),
    page.goto(post.permalink, { waitUntil: 'domcontentloaded' }),
  ])

  const [postData]: Post[] = Object.values(response.posts)
  const comments: Comment[] = Object.values(response.comments)

  if (postData.score === post.score) {
    console.log(`Same score, exiting.`)
    return
  }

  const expandedPost = page.locator(`#${postId}`).first()
  const screenshot = await expandedPost.screenshot({ type: 'png' })

  const { awards, comments: comms, isCrossPost, isImage, isLink, isSelfPost, isVideo } = parsePost({ post: postData, comments })

  const filename = `${post.post_id}_${Date.now()}.png`
  const screenshotPath = await uploadFile({ filename, data: screenshot }).catch(error => {
    console.log(error)
    throw error
  })

  await savePost({
    id: postData.id,
    createdAt: post.created_at.toISOString(),
    screenshotPath,

    title: postData.title,
    titleSentiment: post.title_sentiment,

    subreddit: post.subreddit,
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

  await context.close()
}
