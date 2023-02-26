import { Comment, Post } from '@credee/shared/reddit/types'
import got from 'got'
import { Browser } from 'playwright'
import { uploadFile } from '../../utils/file-upload.js'
import { sentiment } from '../../utils/sentiment.js'
import { listPostsForUpdate, parsePost, removeRedditResult, savePost } from './post-actions.js'

export async function updatePostData(browser: Browser) {
  console.log('Updating Post Data')
  const posts = await listPostsForUpdate()
  console.log(posts.map(post => post.post_id))

  if (!posts.length) return

  const context = await browser.newContext({
    viewport: { height: 1000, width: 1920 },
  })
  const page = await context.newPage()
  let acceptedAll = false

  for await (const post of posts) {
    try {
      console.log(`Updating post ${post.post_id} on subreddit ${post.subreddit}.`)

      const [response] = await Promise.all([
        await got(`https://gateway.reddit.com/desktopapi/v1/postcomments/${post.post_id}`).json<any>(),
        page.goto(post.permalink, { waitUntil: 'domcontentloaded' }),
      ])

      if (!acceptedAll) {
        const selection = await page.waitForSelector(`//button[contains(., 'Accept all')]`)
        await selection.click()
        acceptedAll = true
      }

      const [postData]: Post[] = Object.values(response.posts)
      const comments: Comment[] = Object.values(response.comments)

      const expandedPost = page.locator(`#${post.post_id}`).first()
      const isDeleted = (await expandedPost.getByText('Sorry, this post has been removed').count()) > 0

      if (isDeleted) {
        console.log('Post was deleted.')
        await removeRedditResult(postData.postId)
        continue
      }

      const screenshot = await expandedPost.screenshot({ type: 'png' })

      const {
        awards,
        comments: comms,
        isCrossPost,
        isImage,
        isLink,
        isSelfPost,
        isVideo,
      } = parsePost({ post: postData, comments })

      const filename = `${post.post_id}_${Date.now()}.png`
      const screenshotPath = await uploadFile({ filename, data: screenshot }).catch(error => {
        console.log(error)
        throw error
      })

      await savePost({
        id: postData.postId,
        createdAt: new Date(postData.created).toISOString(),
        screenshotPath,

        title: postData.title,
        titleSentiment: sentiment(postData.title),

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

      console.log('Added post')
    } catch (error) {
      console.log(error)
      continue
    }
  }

  await context.close()
}
