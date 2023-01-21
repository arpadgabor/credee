import type { EventEmitter } from 'node:events'
import { RichTextJSONSegment } from './rich-text.types.js'
import { Media } from './subreddit.types.js'

export interface RedditCrawledPost {
  id: string
  createdAt: string
  title: string

  screenshotPath?: string

  subreddit: string
  author: string
  permalink: string

  domain: string
  url: string
  urlTitle: string

  score: number
  ratio: number
  goldCount: number

  isOriginalContent: boolean
  isSelfPost: boolean
  isCrossPost: boolean
  isVideo: boolean
  isImage: boolean
  isLink: boolean

  media: Media

  nrOfComments: number
  comments: {
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
}

export interface RedditCrawlerOptions {
  subreddit: `/r/${string}`
  endAfter: { count: number }
  notifications?: EventEmitter
}