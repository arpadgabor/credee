import type { Media, RichTextJSONSegment } from '../reddit/types'
import type { Generated } from 'kysely'
import { sql } from 'kysely'

export interface RedditPost {
  id: Generated<number>

  post_id: string
  screenshot_filename: string
  created_at: Date
  title: string
  title_sentiment: number | null

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
  redirect_url?: string
  description?: any
  ends_at?: Date | null
}

export const ExternalPlatform = {
  prolific: 'prolific',
  custom: 'custom',
} as const
export const ExternalPlatforms = Object.keys(ExternalPlatform) as (keyof typeof ExternalPlatform)[]
export interface Participants {
  id: Generated<number>
  survey_id: number
  external_platform: keyof typeof ExternalPlatform
  external_participant_id?: string | null

  response?: {
    age?: number | null
    gender?: 'male' | 'female' | 'other' | null
    nationality?: string | null
    academic_status?: string | null
    academic_field?: string | null

    reddit_usage?: number | null
    social_media_usage?: number | null
    fake_news_ability?: number | null

    reddit_as_news_source?: string | null
  }

  created_at: Generated<Date>
}
export interface ResponsesCredibility {
  id: Generated<number>
  survey_id: number
  participant_id: number
  post_id: string
  post_variant_id: number

  response: {
    credibility: number
    content_style: string
    content_style_other?: string | null
    content_style_effect: number
    topic_familiarity: number
    their_rating: 'upvote' | 'downvote'
    their_rating_why: string
  }

  created_at: Generated<Date>
}

export interface SurveyRedditDataset {
  id: Generated<number>
  survey_id: number
  post_variant_id: number
}

export interface Database {
  reddit_posts: RedditPost
  surveys: Survey
  participants: Participants
  responses_credibility: ResponsesCredibility
  survey_reddit_dataset: SurveyRedditDataset
}

export { sql }
