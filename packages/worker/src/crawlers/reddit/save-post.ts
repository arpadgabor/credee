import { db, json } from '@credee/shared/database'
import { RedditCrawledPost } from '@credee/shared/reddit/types'

export async function savePost(post: RedditCrawledPost) {
  return await db
    .insertInto('reddit_posts')
    .values({
      post_id: post.id,
      title: post.title,
      screenshot_filename: post.screenshotPath!,

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
