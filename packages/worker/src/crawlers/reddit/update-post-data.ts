import { BrowserContext } from 'playwright'
import { crawlPostPage } from './crawl-post-page.js'
import { listPostsForUpdate } from './post-actions.js'
import { Job } from 'bullmq'

export async function updatePostData(browser: BrowserContext, job?: Job) {
  console.log('Updating Post Data')
  const posts = await listPostsForUpdate()
  console.log(posts.map(post => post.post_id))

  if (!posts.length) {
    await job?.log?.('No posts to update')
    return
  }

  await job.log(`Posts in queue: ${posts.length}`)

  const page = await browser.newPage()

  for await (const post of posts) {
    try {
      console.log(`Updating post ${post.post_id} on subreddit ${post.subreddit}.`)

      await crawlPostPage(page, post.post_id, post.subreddit)

      await job?.log?.(`Saved new post ${post.post_id}.`)
      console.log('Added post')
    } catch (error) {
      await job?.log?.(`ERROR! ${error}.`)
      console.log(error)
      continue
    }
  }

  await page.close()
}
