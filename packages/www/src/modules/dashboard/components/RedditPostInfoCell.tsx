import { Match, Switch } from 'solid-js'
import { HoverCard } from '../../../components/ui'
import { uploadsPath } from '../../../utils/trpc'

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'short',
  timeStyle: 'short',
})

const PreviewImage = (props: { name: string }) => (
  <div>
    <Switch>
      <Match when={props.name}>
        <img src={uploadsPath(props.name)} alt='' class='rounded' />
      </Match>

      <Match when={!props.name}>No screenshot found.</Match>
    </Switch>
  </div>
)

export function RedditPostInfoCell(row: {
  postId: string
  permalink: string
  subreddit: string
  author: string
  title: string
  createdAt: string | Date
  screenshotFilename?: string
}) {
  return (
    <div>
      <p class={'font-normal mb-1 text-gray-400 space-x-4'}>
        <small>
          <a class='text-blue-500 underline' href={row.permalink}>
            {row.postId}
          </a>
        </small>
        <small>
          <time>{dateFormat.format(new Date(row.createdAt))}</time>
        </small>
        <small>
          Posted on {row.subreddit} by {row.author}
        </small>
      </p>

      <HoverCard content={<PreviewImage name={row.screenshotFilename!} />}>
        <p>{row.title}</p>
      </HoverCard>
    </div>
  )
}
