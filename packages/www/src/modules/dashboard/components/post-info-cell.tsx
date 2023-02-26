import { createMutation } from '@tanstack/solid-query'
import { TRPCClientError } from '@trpc/client'
import { Match, Switch } from 'solid-js'
import toast from 'solid-toast'
import { ContextMenu, ContextOptions, HoverCard } from '../../../components/ui'
import { api, uploadsPath } from '../../../utils/trpc'
import IconDelete from '~icons/lucide/trash-2'

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
  variantId: number
  postId: string
  permalink: string
  subreddit: string
  author: string
  title: string
  createdAt: string | Date
  screenshotFilename?: string
  onDelete?: () => void
}) {
  const remove = createMutation({
    mutationFn: async () => {
      await api.reddit.removeVariantById.mutate({
        variantId: row.variantId,
      })
    },
    onSuccess() {
      toast.success('Post variant deleted successfully!')
      row.onDelete?.()
    },
    onError(err) {
      if (err instanceof TRPCClientError) {
        toast.error(err?.message)
      } else {
        toast.error('Could not delete the post variant.')
      }
    },
  })

  const contextMenu: ContextOptions[] = [
    {
      content: <>Delete</>,
      command: () => remove.mutate(),
      icon: <IconDelete />,
    },
  ]
  return (
    <ContextMenu options={contextMenu}>
      <p class={'font-normal mb-1 text-gray-400 space-x-4'}>
        <small>
          <a class='text-accent-500 underline' href={row.permalink}>
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
    </ContextMenu>
  )
}
