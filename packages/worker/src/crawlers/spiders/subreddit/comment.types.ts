import type { RichTextJSONSegment } from './rich-text.js'

export interface Comments {
  comments: Comment[]
}

export interface Comment {
  author: string
  authorId: string
  collapsed: boolean
  collapsedReason: null
  collapsedBecauseCrowdControl: null
  collapsedReasonCode: null
  created: number
  depth: number
  deletedBy: null
  distinguishType: null
  editedAt: number | null
  gildings: null
  goldCount: number
  id: string
  isAdmin: boolean
  isDeleted: boolean
  isGildable: boolean
  isLocked: boolean
  isMod: boolean
  isOp: boolean
  isSaved: boolean
  isStickied: boolean
  isScoreHidden: boolean
  next: Next | null
  parentId: null | string
  permalink: string
  prev: Next | null
  postAuthor: null
  postId: string
  postTitle: null
  score: number
  sendReplies: boolean
  subredditId: string
  voteState: number
  media: Media
  profileImage?: string
  profileOver18?: boolean
}

export interface Media {
  richtextContent: RichTextJSONSegment
  type: MediaType
  rteMode: RTEMode
}

export enum RTEMode {
  Richtext = 'richtext',
}

export enum MediaType {
  Rtjson = 'rtjson',
}

export interface Next {
  id: string
  type: NextType
}

export enum NextType {
  Comment = 'comment',
}
