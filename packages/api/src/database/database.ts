import type { Generated } from 'kysely'
import type { RichTextJSONSegment, Media } from '@credee/shared/reddit/types.js'

export interface RedditPost {
  id: Generated<number>

  post_id: string
  screenshot_filename: string
  created_at: Date
  title: string

  subreddit: string
  author: string
  permalink: string
  flair?: string

  domain: string
  url: string
  url_title: string

  score: number
  ratio: number
  gold_count: number

  is_original_content: boolean
  is_self_post: boolean
  is_cross_post: boolean
  is_video: boolean
  is_image: boolean
  is_link: boolean

  media: Media

  nr_of_comments: number
  comments?: string
  comments_raw: {
    id: string
    author: string
    content: RichTextJSONSegment
    createdAt: string
    editedAt: string | null
    gildings: null
    goldCount: number
    permalink: string
    score: number
    voteState: number
  }[]

  awards?: {
    id: string
    name: string
    count: number
    description: string
    icon: string
  }[]

  inserted_at?: Date
}

export interface Survey {
  id: Generated<number>
  title: string
  ends_at: Date
}
export interface Participants {
  id: Generated<number>
  survey_id: Survey['id']
  external_platform: string
  external_participant_id: string
  age_range?: string | null
  gender?: string | null
  nationality?: string | null
  marital_status?: string | null
  academic_status?: string | null
  employment_status?: string | null
  annual_income_level?: string | null
  onboarding_answers?: string | null
  created_at: Date
}
export interface ResponsesCredibility {
  id: Generated<number>
  survey_id: Survey['id']
  participant_id: Participants['id']
  post_id: RedditPost['post_id']
  post_variant_id: RedditPost['id']
  credibility: number
}

export interface Database {
  reddit_posts: RedditPost
  surveys: Survey
  participants: Participants
  responses_credibility: ResponsesCredibility
}
