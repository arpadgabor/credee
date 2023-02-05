import { Outputs } from '@credee/api'
import { createComputed, Show } from 'solid-js'
import { InfoTag } from './info-tag'
import { SentimentMeter } from './sentiment-meter'

type Post = Outputs['reddit']['redditByPostId']['data'][number]
export function PostTags(props: { post: Post }) {
  const latestHistory = () => props.post.history[props.post.history.length - 1]

  return (
    <div class='flex text-xs text-gray-700 mt-2 space-x-4'>
      <Show when={Number.isFinite(props.post.title_sentiment)}>
        <SentimentMeter sentiment={props.post.title_sentiment!} />
      </Show>

      <InfoTag label='Upvotes' icon='arrowUp' value={latestHistory().score} />

      <InfoTag label='Ratio' icon='upDown' value={latestHistory().ratio * 100 + '%'} />

      <InfoTag label='Comments' icon='message' value={latestHistory().comments} />

      <InfoTag label='Awards' icon='coin' value={latestHistory().gold} />

      <InfoTag label='Scrape times' icon='files' value={props.post.history.length} />
    </div>
  )
}
