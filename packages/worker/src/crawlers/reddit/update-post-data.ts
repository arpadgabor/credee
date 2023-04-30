import { BrowserContext } from 'playwright'
import { crawlPostPage } from './crawl-post-page.js'
import { listPostsForUpdate } from './post-actions.js'
import { Job } from 'bullmq'
import { UpdaterOptions } from '@credee/shared/reddit/queue'

export async function updatePostData(browser: BrowserContext, job?: Job<UpdaterOptions>) {
  console.log('Updating Post Data')
  const posts = await listPostsForUpdate(job.data?.maxScrapes, job.data?.maxDays)
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
      const start = Date.now()

      const result = await crawlPostPage(page, post.post_id, post.subreddit)

      const end = Date.now()
      const takenSeconds = ((end - start) / 1000).toFixed(2)
      result && (await job?.log?.(`Done with ${post.post_id} in ${takenSeconds}s.`))
    } catch (error) {
      await job?.log?.(`ERROR! ${error}.`)
      console.log(error)
      continue
    }
  }

  await page.close()
}
