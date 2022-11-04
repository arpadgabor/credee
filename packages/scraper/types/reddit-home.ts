export interface RedditHomeResponse {
  home: Home
  trendingSubreddits: Subreddit[]
  recentPosts: any[]
  featuredAnnouncements: null
  liveBarContent: LiveBarContent
}

export interface Home {
  elements: Elements
}

export interface Elements {
  pageInfo: PageInfo
  dist: number
  geoFilter: string
  edges: Edge[]
}

export interface Edge {
  node: Node
}

export interface Node {
  __typename: NodeTypename
  id: string
  createdAt: string
  crosspostCount: number
  isReactAllowed: boolean
  reactedFrom: null
  attributionInfo: null
  crowdControlLevel: CrowdControlLevel
  discussionType: DiscussionType
  domain: string
  editedAt: null
  flair: Flair | null
  awardings: Awarding[]
  isArchived: boolean
  isCreatedFromAdsUi: boolean
  isContestMode: boolean
  isHidden: boolean
  isLocked: boolean
  isNsfw: boolean
  isOriginalContent: boolean
  isSaved: boolean
  isScoreHidden: boolean
  isSelfPost: boolean
  isSpoiler: boolean
  isStickied: boolean
  isTrackingCrossposts: boolean
  isVisited: boolean
  liveCommentsWebsocket: string
  moderationInfo: null
  outboundLink: OutboundLink
  permalink: string
  removedBy: null
  removedByCategory: null
  topAwardedType: null | string
  score: number | null
  suggestedCommentSort: null | string
  title: string
  url: string
  whitelistStatus: WhitelistStatus
  voteState: VoteState
  authorFlair: AuthorFlair | null
  authorInfo: AuthorInfo
  authorOnlyInfo: null
  commentCount: number
  content: Content | null
  distinguishedAs: null
  gallery: null
  isCrosspostable: boolean
  isFollowed: boolean
  isGildable: boolean
  isMediaOnly: boolean
  isPollIncluded: boolean
  media: Media | null
  postEventInfo: null
  thumbnail: LegacyIcon | null
  upvoteRatio: number
  viewCount: null
  poll?: null
  subreddit?: Subreddit
  predictionTournament?: null
  audioRoom?: null
  crosspostRoot: null
  subcaption?: null
  impressionId?: string
  isBlank?: boolean
  adEvents?: AdEvent[]
  callToAction?: string
  isSurveyAd?: boolean
  profile?: Profile
  adSupplementaryTextRichtext?: null
  promotedUserPosts?: null
}

export enum NodeTypename {
  AdPost = 'AdPost',
  SubredditPost = 'SubredditPost',
}

export interface AdEvent {
  type: string
  url: string
}

export interface AuthorFlair {
  text: string
  type: TemplateType
  template: Template
  cssClass: string
  richtext: string
}

export interface Template {
  id: null | string
  type: TemplateType
  text: string
  richtext: null | string
  textColor: TextColor
  backgroundColor: null | string
  isEditable: boolean
  isModOnly: boolean
  cssClass: string
  maxEmojis: number
  allowableContent: AllowableContent
  postStyle: PostStyle | null
}

export enum AllowableContent {
  All = 'ALL',
}

export interface PostStyle {
  id: string
  postBackgroundColor: null | string
  postTitleColor: null | string
  postBackgroundImage: null
  postPlaceholderImage: null | string
}

export enum TextColor {
  Dark = 'DARK',
  Light = 'LIGHT',
}

export enum TemplateType {
  Richtext = 'richtext',
  Text = 'text',
}

export interface AuthorInfo {
  __typename: AuthorInfoTypename
  id: string
  name: string
  isPremiumMember: boolean
}

export enum AuthorInfoTypename {
  Redditor = 'Redditor',
}

export interface Awarding {
  award: Award
  total: number
}

export interface Award {
  awardType: AwardType
  awardSubType: AwardType
  coinPrice: number
  coinReward: number
  daysOfDripExtension: null
  daysOfPremium: number | null
  description: string
  giverCoinReward: null
  icon: Icon
  icon32: Icon
  icon64: Icon
  icon128: Icon
  staticIcon: Icon
  staticIcon32: Icon
  staticIcon64: Icon
  staticIcon128: Icon
  id: string
  isEnabled: boolean
  isNew: boolean
  name: string
  subredditCoinReward: number
  tags: string[]
  tiers: null
  pennyPrice: number | null
  pennyDonate: null
  startsAt: null
  endsAt: null
  isOptional: boolean
}

export enum AwardType {
  Appreciation = 'APPRECIATION',
  Global = 'GLOBAL',
  Premium = 'PREMIUM',
}

export interface Icon {
  url: string
}

export interface Content {
  markdown: string
  richtext: string
  richtextMedia: any[]
}

export enum CrowdControlLevel {
  Off = 'OFF',
  Strict = 'STRICT',
}

export enum DiscussionType {
  Comment = 'COMMENT',
}

export interface Flair {
  richtext: null | string
  text: string
  type: TemplateType
  template: Template
}

export interface Media {
  typeHint: TypeHint | null
  still: Still | null
  obfuscatedStill: ObfuscatedStill | null
  animated: null
  streaming: Streaming | null
  video: Video | null
  RPAN: null
}

export interface ObfuscatedStill {
  source: LegacyIcon | null
}

export interface LegacyIcon {
  url: string
  dimensions: Dimensions
}

export interface Dimensions {
  width: number
  height: number
}

export interface Still {
  source: LegacyIcon
  small: LegacyIcon
  medium: LegacyIcon
  large: LegacyIcon
  xlarge: LegacyIcon | null
  xxlarge: LegacyIcon | null
  xxxlarge: LegacyIcon | null
}

export interface Streaming {
  hlsUrl: string
  dashUrl: string
  scrubberMediaUrl: string
  dimensions: Dimensions
  duration: number
  isGif: boolean
}

export enum TypeHint {
  Embed = 'EMBED',
  Image = 'IMAGE',
  Video = 'VIDEO',
}

export interface Video {
  embedHtml: string
  embedUrl: string
  url: string
  dimensions: Dimensions
  attribution: Attribution
}

export interface Attribution {
  title: string
  description: string
  authorName: null
  authorUrl: null
  providerName: string
  providerUrl: string
}

export interface OutboundLink {
  expiresAt: string | null
  url: string
}

export interface Profile {
  id: string
}

export interface Subreddit {
  id: string
  styles: Styles
  name: string
  subscribers: number
  title: string
  type: TrendingSubredditType
  path: string
  isFavorite: boolean
  isNSFW: boolean
  isQuarantined: boolean
  isSubscribed: boolean
  wls: WhitelistStatus
  prefixedName: string
  postFlairSettings: PostFlairSettings
  isThumbnailsEnabled: boolean
  isFreeFormReportingAllowed: boolean
}

export interface PostFlairSettings {
  position: Position | null
  isEnabled: boolean
  isSelfAssignable: boolean
}

export enum Position {
  Left = 'LEFT',
  Right = 'RIGHT',
}

export interface Styles {
  legacyIcon: LegacyIcon | null
  primaryColor: null | string
  icon: null | string
}

export enum TrendingSubredditType {
  Archived = 'ARCHIVED',
  Public = 'PUBLIC',
}

export enum WhitelistStatus {
  AllAds = 'ALL_ADS',
  NoAds = 'NO_ADS',
  PromoAdultNsfw = 'PROMO_ADULT_NSFW',
  SomeAds = 'SOME_ADS',
}

export enum VoteState {
  None = 'NONE',
}

export interface PageInfo {
  hasNextPage: boolean
  hasPreviousPage: boolean
  startCursor: string
  endCursor: string
}

export interface LiveBarContent {
  posts: any[]
  items: Items
}

export interface Items {
  edges: any[]
}
