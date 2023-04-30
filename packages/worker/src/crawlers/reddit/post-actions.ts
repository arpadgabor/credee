import { db, json, sql } from '@credee/shared/database'
import { Post, RedditCrawledPost, Comment } from '@credee/shared/reddit/types'
import { subDays } from 'date-fns'
import { deleteFile } from '../../utils/file-upload.js'

export function parsePost({ post, comments }: { post: Post; comments: Comment[] }) {
  const isSelfPost = post.media?.type === 'rtjson'
  const isCrossPost = !!post.crosspostParentId
  const isVideo = ['Vimeo', 'YouTube', 'Gfycat'].includes(post.media?.provider)
  const isImage = post.media?.type === 'image'
  const isLink = !(isSelfPost || isCrossPost || isVideo || isImage)

  const comms = comments
    .filter(com => !(com.isAdmin || com.isMod))
    .map(com => ({
      id: com.id,
      author: com.author,
      content: com.media?.richtextContent,
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

  return {
    isSelfPost,
    isCrossPost,
    isVideo,
    isImage,
    isLink,
    comments: comms,
    awards,
  }
}

export async function savePost(post: RedditCrawledPost) {
  return await db
    .insertInto('reddit_posts')
    .values({
      post_id: post.id,
      title: post.title,
      screenshot_filename: post.screenshotPath!,
      title_sentiment: post.titleSentiment,

      domain: post.domain,
      url: post.url,
      url_title: post.urlTitle,

      ratio: post.ratio,
      score: post.score,
      awards: json(post.awards),

      permalink: post.permalink,
      author: post.author,
      subreddit: post.subreddit,
      flair: post.flair,

      nr_of_comments: post.nrOfComments,
      comments_raw: json(post.comments),

      media: json(post.media),
      gold_count: post.goldCount,
      is_cross_post: post.isCrossPost,
      is_image: post.isImage,
      is_link: post.isLink,
      is_original_content: post.isOriginalContent,
      is_self_post: post.isSelfPost,
      is_video: post.isVideo,

      created_at: new Date(post.createdAt),
    })
    .execute()
}

export async function getPost(postId: string) {
  const post = await db.selectFrom('reddit_posts').selectAll().where('post_id', '=', postId).executeTakeFirst()
  return post
}

export async function listPostsForUpdate(maxScrapes = 36, dayLimit = 3) {
  const posts = await db
    .selectFrom('reddit_posts')
    .select(['post_id', 'permalink', 'subreddit', 'created_at'])
    .groupBy(['post_id', 'permalink', 'subreddit', 'created_at'])
    .having(b => sql`count(${b.ref('post_id')})`, '<', maxScrapes)
    .having('created_at', '>', subDays(new Date(), dayLimit))
    .execute()

  return posts
}

export async function removeRedditResult(postId: string) {
  const result = await db
    .selectFrom('survey_reddit_dataset')
    .select('post_variant_id')
    .leftJoin('reddit_posts', 'reddit_posts.id', 'survey_reddit_dataset.post_variant_id')
    .where('reddit_posts.post_id', '=', postId)
    .execute()

  if (result.length) {
    return
  }

  const deleted = await db.deleteFrom('reddit_posts').where('post_id', '=', postId).returningAll().execute()
  await Promise.all(deleted.map(post => deleteFile(post.screenshot_filename)))
}
