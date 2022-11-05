export interface SubredditResponse {
  authorFlair: AuthorFlair
  postIds: string[]
  posts: Posts
  profiles: Record<string, unknown>
  subreddits: Subreddits
  postFlair: PostFlair
  postInstances: { [key: string]: string[] }
  token: string
  dist: number
  account: Account
  features: Features
  listingSort: string
  subredditPermissions: null
  preferences: null
  subredditAboutInfo: Record<string, SubredditAboutInfo>
  userFlair: UserFlair
  structuredStyles: null
}

export interface SubredditAboutInfo {
  accountsActive: number
  advertiserCategory: string
  usingNewModmail: boolean
  publicDescription: string
  showMedia: boolean
  subscribers: number
  userIsSubscriber: boolean
  userIsContributor: boolean
  restrictPosting: boolean
  restrictCommenting: boolean
  disableContributorRequests: boolean
  submitLinkLabel: string
  submitTextLabel: string
  created: number
  acceptFollowers: boolean
  userIsBanned: boolean
  emojisEnabled: boolean
  contentCategory: string
  allOriginalContent: boolean
  originalContentTagEnabled: boolean
  hasExternalAccount: boolean
  allowChatPostCreation: boolean
  activity7Day: number
  shouldArchivePosts: boolean
  allowedPostTypes: AllowedPostTypes
}

export interface Account {
  displayText: string
  url: string
  accountIcon: string
  id: string
  created: number
  email: string
  hasUnreadMail: boolean
  hasUnreadOldModmail: boolean
  hasUnreadModmail: boolean
  hasUserProfile: boolean
  inboxCount: number
  isEmployee: boolean
  isMod: boolean
  hasVerifiedEmail: boolean
  inRedesignBeta: boolean
  commentKarma: number
  postKarma: number
  isGold: boolean
  awardedLastMonth: null
  creddits: number
  coins: number
  goldExpiration: null
  gildedLastMonth: null
  inChat: boolean
  showRecentPosts: number
  showTrending: boolean
  nightmode: boolean
  geopopular: string
  profileId: string
  seenRedesignModal: boolean
  seenLayoutSwitch: boolean
  seenPremiumAdblockModal: boolean
  seenSubredditChatFtux: boolean
  seenGiveAwardTooltip: boolean
  showPresence: boolean
  showTwitter: boolean
  hasExternalAccount: boolean
  hasGoldSubscription: boolean
  hasPaypalSubscription: boolean
  hasStripeSubscription: boolean
  hasSubscribedToPremium: boolean
  hasAndroidSubscription: boolean
  hasIOSSubscription: boolean
  isSuspended: boolean
  isFPR: boolean
  canCreateSubreddit: boolean
  linkedIdentities: boolean
  isPasswordSet: boolean
  isNameEditable: boolean
  snoovatarFullBodyAsset: string
  isBlocked: boolean
  suspensionExpirationUtc: null
}

export interface AuthorFlair {
  t5_2qlqh: { [key: string]: Applied | null }
}

export interface Applied {
  text: string
  richtext?: any[]
  type: EEnum
  textColor: TextColor
  backgroundColor: BackgroundColor | null
  templateId: null | string
}

export enum BackgroundColor {
  D3D6Da = '#d3d6da',
  Empty = '',
}

export enum TextColor {
  Dark = 'dark',
}

export enum EEnum {
  Li = 'li',
  Link = 'link',
  R = 'r/',
  Text = 'text',
}

export interface Features {
  mod_service_mute_writes: boolean
  promoted_trend_blanks: boolean
  show_amp_link: boolean
  top_content_email_digest_v2: WtfIsThis
  chat: boolean
  is_email_permission_required: boolean
  mod_awards: boolean
  mweb_xpromo_revamp_v3: WtfIsThis
  mweb_xpromo_revamp_v2: WtfIsThis
  awards_on_streams: boolean
  webhook_config: boolean
  mweb_xpromo_modal_listing_click_daily_dismissible_ios: boolean
  live_orangereds: boolean
  cookie_consent_banner: boolean
  modlog_copyright_removal: boolean
  do_not_track: boolean
  images_in_comments: boolean
  mod_service_mute_reads: boolean
  chat_user_settings: boolean
  use_pref_account_deployment: boolean
  mweb_xpromo_interstitial_comments_ios: boolean
  chat_subreddit: boolean
  mweb_sharing_clipboard: WtfIsThis
  premium_subscriptions_table: boolean
  mweb_xpromo_interstitial_comments_android: boolean
  crowd_control_for_post: boolean
  mweb_nsfw_xpromo: WtfIsThis
  noreferrer_to_noopener: boolean
  chat_group_rollout: boolean
  resized_styles_images: boolean
  spez_modal: boolean
  mweb_xpromo_modal_listing_click_daily_dismissible_android: boolean
  expensive_coins_package: boolean
}

export interface WtfIsThis {
  owner: string
  variant: string
  experiment_id: number
}

export interface PostFlair {
  [key: string]: PostFlairData
}

export interface PostFlairData {
  displaySettings: PurpleDisplaySettings
  permissions: PurplePermissions
  templates: { [key: string]: Template }
  templateIds: string[]
}

export interface PurpleDisplaySettings {
  isEnabled: boolean
  position: string
}

export interface PurplePermissions {
  canAssignOwn: boolean
}

export interface Template {
  id: string
  text: string
  textEditable: boolean
  richtext: any[]
  type: EEnum
  textColor: TextColor
  backgroundColor: BackgroundColor
  modOnly: boolean
  cssClass: string
  maxEmojis: number
  allowableContent: AllowableContent
  overrideCss?: null
}

export enum AllowableContent {
  All = 'all',
}

export interface Posts {
  [key: string]: Post
}

export interface Post {
  id: string
  numComments: number
  created: number
  score: number
  distinguishType: null
  isLocked: boolean
  isStickied: boolean
  thumbnail: Preview
  title: string
  author: string
  authorId: string
  authorIsBlocked: boolean
  domain: string
  postId: string
  upvoteRatio: number
  numDuplicates: null
  discussionType: null
  viewCount: number
  goldCount: number
  isArchived: boolean
  contestMode: boolean
  gildings: Gildings | null
  postCategories: null
  suggestedSort: null | string
  belongsTo: BelongsTo
  flair: Applied[]
  hidden: boolean
  saved: boolean
  isGildable: boolean
  isMediaOnly: boolean
  isSponsored: boolean
  isNSFW: boolean
  isMeta: boolean
  isSpoiler: boolean
  isBlank: boolean
  sendReplies: boolean
  voteState: number
  permalink: string
  events: Event[]
  eventsOnRender: string[]
  callToAction: string
  domainOverride: string
  impressionId: number
  isSurveyAd: null
  impressionIdStr: null
  isCreatedFromAdsUi: boolean
  adSupplementaryText: null
  adPromotedUserPostIds: any[]
  subcaption: null
  media: Media
  preview: Preview
  crosspostRootId: null
  crosspostParentId: null
  numCrossposts: number
  isCrosspostable: boolean
  liveCommentsWebsocket: string
  source: Source
  isOriginalContent: boolean
  contentCategories: null
  isScoreHidden: boolean
  allAwardings?: AllAwarding[]
}

export interface AllAwarding {
  awardType: AwardType
  awardSubType: AwardSubType
  coinPrice: number
  coinReward: number
  daysOfDripExtension: null
  daysOfPremium: null
  description: string
  giverCoinReward: null
  iconUrl: string
  iconWidth: number
  iconHeight: number
  staticIconUrl: string
  staticIconWidth: number
  staticIconHeight: number
  id: string
  isEnabled: boolean
  isNew: boolean
  name: string
  pennyDonate: null
  pennyPrice: number | null
  resizedIcons: Preview[]
  resizedStaticIcons: Preview[]
  subredditCoinReward: number
  subredditId: null
  awardingsRequiredToGrantBenefits: null
  tiersByRequiredAwardings: null
  count: number
}

export enum AwardSubType {
  Global = 'GLOBAL',
}

export enum AwardType {
  Global = 'global',
}

export interface Preview {
  url: string
  width: number | null
  height: number | null
}

export interface BelongsTo {
  id: string
  type: BelongsToType
}

export enum BelongsToType {
  Profile = 'profile',
  Subreddit = 'subreddit',
}

export interface Gildings {
  gid1: number
  gid2: number
  gid3: number
}

export interface T37W17SuMedia {
  richtextContent: RichtextContent
  rteMode: RTEMode
}

export interface RichtextContent {
  document: Document[]
}

export interface Document {
  [key: string]: unknown
}

export enum RTEMode {
  Richtext = 'richtext',
}

export interface Event {
  url: string
  type: number
}

export interface Source {
  displayText: string
  url: string
}

export interface Media {
  obfuscated: null
  content: string
  type: string
  width: number
  height: number | null
  provider: string
  richtextContent: RichtextContent
  mediaMetadata: unknown
  rteMode: RTEMode
}

export interface AllowedPostTypes {
  links: boolean
  images: boolean
  videos: boolean
  text: boolean
  spoilers: boolean
  polls: boolean
  galleries: boolean
  talks: boolean
}

export interface Subreddits {
  [key: string]: SubredditInfo
}

export interface SubredditInfo {
  id: string
  acceptFollowers: boolean
  allowChatPostCreation: boolean
  isChatPostFeatureEnabled: boolean
  displayText: string
  type: string
  isQuarantined: boolean
  isNSFW: boolean
  name: string
  url: string
  title: string
  icon: Preview
  whitelistStatus: string
  wls: number
  communityIcon: null
  primaryColor: string
  subscribers: number
  isEnrolledInNewModmail: boolean
  allowPredictions: boolean
  allowPredictionsTournament: boolean
  allowTalks: boolean
}

export interface UserFlair {
  [key: string]: UserFlairData
}

export interface UserFlairData {
  displaySettings: FluffyDisplaySettings
  permissions: FluffyPermissions
  applied: Applied
  templates: { [key: string]: Template }
  templateIds: string[]
}

export interface FluffyDisplaySettings {
  isUserEnabled: boolean
  isEnabled: boolean
  position: string
}

export interface FluffyPermissions {
  canUserChange: boolean
  canAssignOwn: boolean
}
