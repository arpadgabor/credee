import { db, json } from '@credee/shared/database'
import { Post, RedditCrawledPost, Comment } from '@credee/shared/reddit/types'

export function parsePost({ post, comments }: { post: Post; comments: Comment[] }) {
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
