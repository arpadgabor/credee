import { createMutation, createQuery } from '@tanstack/solid-query'
import { TRPCClientError } from '@trpc/client'
import { Match, Show, Switch } from 'solid-js'
import toast from 'solid-toast'
import { ContextMenu, ContextOptions, HoverCard } from '../../../components/ui'
import { api, uploadsPath } from '../../../utils/trpc'
import IconDelete from '~icons/lucide/trash-2'
import IconAddToList from '~icons/lucide/list-plus'
import { useSurveyQuestionChooser } from '../logic/survey-question-chooser'

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'short',
  timeStyle: 'short',
})

export const PreviewImage = (props: { name: string }) => (
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
  const { selectedVariants, toggleVariant } = useSurveyQuestionChooser()

  const surveys = createQuery(() => ['reddit_surveys'], {
    async queryFn() {
      return api.surveys.list.query()
    },
  })

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
  const assign = createMutation({
    mutationFn: async (surveyId: number) => {
      await api.surveys.addVariantToSurvey.mutate({
        surveyId,
        variantId: row.variantId,
      })
    },
    onSuccess() {
      toast.success('Variant added to survey!')
    },
    onError(err) {
      if (err instanceof TRPCClientError) {
        toast.error(err?.message)
      } else {
        toast.error('Could not add variant.')
      }
    },
  })

  const contextMenu: ContextOptions[] = [
    {
      content: <>Add to survey</>,
      children:
        surveys.data?.data.map((survey, idx) => ({
          command: () => assign.mutate(survey.id),
          content: <>Survey 1</>,
          icon: <div class='font-mono font-bold text-gray-500 flex items-center'>{idx + 1}</div>,
        })) || [],
      icon: <IconAddToList />,
    },
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

      <p class='flex items-center'>
        <Show when={selectedVariants().includes(row.variantId)}>
          <span class='px-2 py-1 rounded bg-accent-500 text-white text-xs mr-2'>Selected</span>
        </Show>
        {row.title}
      </p>
    </ContextMenu>
  )
}
