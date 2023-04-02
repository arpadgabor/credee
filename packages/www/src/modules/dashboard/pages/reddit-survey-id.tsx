import { NavLink, useParams } from '@solidjs/router'
import { createMutation, createQuery } from '@tanstack/solid-query'
import { stringify as toCsv } from 'csv-stringify/browser/esm/sync'
import { Match, Show, Switch, createMemo, createSignal, onMount } from 'solid-js'

import { createColumnHelper, createSolidTable, getCoreRowModel } from '@tanstack/solid-table'
import {
  Button,
  DataTable,
  DateCell,
  FieldAlert,
  FieldLabel,
  Input,
  PageHeader,
  StringCell,
  Tabs,
} from '../../../components/ui'

import DownloadIcon from '~icons/ph/download'
import CopyIcon from '~icons/ph/copy'
import RefreshIcon from '~icons/ph/arrows-counter-clockwise'
import { Outputs } from '@credee/api'
import { api } from '../../../utils/trpc'
import toast from 'solid-toast'

import Survey from '../../survey/pages/survey'
import { PreviewImage, RedditPostInfoCell } from '../components/post-info-cell'
import { z } from 'zod'
import { Field, Form, FormState, createForm, setValue, zodForm } from '@modular-forms/solid'
import { HoverCard } from '../../../components/ui/hover-card'
import { cx } from 'class-variance-authority'

type Survey = Outputs['surveys']['getByIdDetailed']
type Answer = Survey['answers'][number]
type Variant = Survey['variants'][number]

const formValidator = z.object({
  title: z.string({ required_error: 'The title is required.' }).min(1, 'Please enter a title for the survey.'),
  redirectUrl: z.string().url(),
  endDate: z
    .string()
    .optional()
    .refine(
      value => {
        if (!value) return true
        const date = new Date(value)
        return date > new Date()
      },
      { message: 'The deadline must be at least 1 day in the future.' }
    ),
})

export default function RedditSurveyId() {
  const params = useParams<{ id: string }>()
  const updateForm = createForm({
    validate: zodForm(formValidator),
  })
  const survey = createQuery<Survey>(() => [params.id], {
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    queryFn() {
      return api.surveys.getByIdDetailed.query({
        surveyId: Number(params.id),
      })
    },
    onSuccess(data) {
      setValue(updateForm, 'title', data.title)
      setValue(updateForm, 'redirectUrl', data.redirectUrl!)
      !!data.deadline && setValue(updateForm, 'endDate', data.deadline.toISOString().split('T')[0])
    },
  })

  function copyUrl() {
    const url = `${location.origin}/survey/${params.id}?referrer=custom`
    navigator.clipboard.writeText(url)
    toast.success('URL copied to your clipboard!')
  }

  const answers = createMemo(() => survey.data?.answers || [])
  const variants = createMemo(() => survey.data?.variants || [])

  const tabs = [
    {
      content: <DetailsForm surveyId={Number(params.id)} form={updateForm} />,
      name: 'Details',
    },
    {
      content: <SurveyResponses answers={answers()} onRefresh={() => survey.refetch()} isLoading={survey.isRefetching} />,
      name: 'Responses',
    },
    {
      content: <SurveyDataset variants={variants()} />,
      name: 'Dataset',
    },
  ]

  const description = (
    <div>
      <div>
        URL for testing:{' '}
        <code>
          {location.origin}/survey/{params.id}?referrer=custom
        </code>
        <button class='ml-2' onClick={copyUrl} title='Copy URL to clipboard'>
          <CopyIcon />
        </button>
      </div>
    </div>
  )

  return (
    <Switch>
      <Match when={survey.isLoading}>Loading</Match>
      <Match when={survey.isSuccess && survey.data}>
        <section>
          <PageHeader title={survey.data!.title} description={description} />

          <main class='pt-4'>
            <Tabs ariaLabel='Survey Detail Tabs' tabs={tabs} />
          </main>
        </section>
      </Match>
    </Switch>
  )
}

function DetailsForm(props: { surveyId: number; form: FormState<z.infer<typeof formValidator>> }) {
  const createSurvey = createMutation({
    mutationFn: (data: z.infer<typeof formValidator>) => {
      return api.surveys.update.mutate({
        id: props.surveyId,
        title: data.title,
        endsAt: data.endDate ? new Date(data.endDate) : undefined,
        redirectUrl: data.redirectUrl,
      })
    },
    onSuccess: () => {
      toast.success('Survey updated!')
    },
  })

  function onSubmit(data: z.infer<typeof formValidator>) {
    createSurvey.mutate(data)
  }

  return (
    <Form of={props.form} onSubmit={onSubmit} class='flex flex-col h-full space-y-4 max-w-lg'>
      <Field of={props.form} name='title'>
        {field => (
          <label class='w-full'>
            <FieldLabel>Title</FieldLabel>
            <Input {...field.props} value={field.value} class='w-full' />
            <Show when={field.error}>
              <FieldAlert type='error'>{field.error}</FieldAlert>
            </Show>
          </label>
        )}
      </Field>

      <Field of={props.form} name='redirectUrl'>
        {field => (
          <label class='w-full'>
            <FieldLabel>URL to redirect after finishing</FieldLabel>
            <Input {...field.props} value={field.value} class='w-full' type='url' />
            <Show when={field.error}>
              <FieldAlert type='error'>{field.error}</FieldAlert>
            </Show>
          </label>
        )}
      </Field>

      <Field of={props.form} name='endDate'>
        {field => (
          <label class='w-full'>
            <FieldLabel>Deadline</FieldLabel>
            <Input {...field.props} value={field.value} type='date' class='w-full' />
            <Show when={field.error}>
              <FieldAlert type='error'>{field.error}</FieldAlert>
            </Show>
          </label>
        )}
      </Field>

      {/* <PostsForSurveySelect form={submitForm} fieldName='posts' /> */}

      <div class='flex-1 flex items-end'>
        <Button theme='main' disabled={createSurvey.isLoading}>
          Save
        </Button>
      </div>
    </Form>
  )
}

function SurveyResponses(props: { answers: Answer[]; onRefresh: () => void; isLoading: boolean }) {
  const col = createColumnHelper<Answer>()
  const table = createSolidTable({
    get data() {
      return props.answers
    },
    columns: [
      col.accessor('post.title', {
        cell: StringCell,
        header: 'Post title',
      }),
      col.accessor('post.upvotes', {
        cell: StringCell,
        header: 'Score',
      }),
      col.accessor('post.ratio', {
        cell: StringCell,
        header: 'Ratio',
      }),
      col.accessor('post.postedAt', {
        cell: DateCell,
        header: 'Posted at',
      }),
      col.accessor('credibility', {
        cell: StringCell,
        header: 'Rating: Credibility',
      }),
      col.accessor('academicStatus', {
        cell: StringCell,
        header: 'Education',
      }),
      col.accessor('contentStyle', {
        cell: StringCell,
        header: 'Content style',
      }),
      col.accessor('contentStyleEffect', {
        cell: StringCell,
        header: 'Content style effect',
      }),
      col.accessor('ageRange', {
        cell: StringCell,
        header: 'Age',
      }),
      col.accessor('contentStyleOther', {
        cell: StringCell,
        header: 'Style Other',
      }),
      col.accessor('gender', {
        cell: StringCell,
        header: 'Gender',
      }),
      col.accessor('redditUsage', {
        cell: StringCell,
        header: 'Reddit usage',
      }),
      col.accessor('fakeNewsAbility', {
        cell: StringCell,
        header: 'Fake news ability',
      }),
      col.accessor('socialMediaUsage', {
        cell: StringCell,
        header: 'Social media usage',
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
  })
  const [csvDownloadHref, setCsvDownloadHref] = createSignal<string>()
  onMount(() => {
    const csv = toCsv(
      props.answers.map(({ post, ...rest }) => ({
        'Responded At': new Date(rest.respondedAt).toLocaleString(),
        'External Platform': rest.externalPlatform,
        'Participant ID': rest.participantId,
        Gender: rest.gender,
        'Age Range': rest.ageRange,
        'Studies Level': rest.academicStatus,
        'Reddit Usage': rest.redditUsage,
        'Social Media Usage': rest.socialMediaUsage,
        'Fake News Ability': rest.fakeNewsAbility,
        'Credibility Rating': rest.credibility,
        'Content Style': rest.contentStyle,
        'Content Style Effect': rest.contentStyleOther || rest.contentStyleEffect,
        '[Post] Title': post.title,
        '[Post] Title Sentiment': post.titleSentiment,
        '[Post] Link Domain': post.domain,
        '[Post] Subreddit': post.subreddit,
        '[Post] Award Count': post.goldCount,
        '[Post] Comments': post.comments,
        '[Post] Upvote Ratio': post.ratio,
        '[Post] Upvotes': post.upvotes,
        '[Post] Posted At': post.postedAt ? new Date(post.postedAt).toLocaleString() : '',
      })),
      {
        header: true,
      }
    )

    const dataUrl = `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    setCsvDownloadHref(dataUrl)
  })

  return (
    <div>
      <div class='flex mb-2 space-x-2'>
        <Show when={csvDownloadHref()}>
          <a href={csvDownloadHref()!} download={'Responses.csv'}>
            <Button type='button' disabled={props.answers.length === 0} tabIndex={-1}>
              <DownloadIcon class='mr-3' />
              Download Responses CSV
            </Button>
          </a>
          <Button type='button' onClick={props.onRefresh}>
            <RefreshIcon class={cx(['mr-3', props.isLoading ? 'animate-spin' : ''])} />
            Refresh
          </Button>
        </Show>
      </div>
      <DataTable table={table} loading={false} error={false} size='auto' hideFooter={true} />
    </div>
  )
}

function SurveyDataset(props: { variants: Variant[] }) {
  const col = createColumnHelper<Variant>()
  const columns = [
    col.accessor('screenshot', {
      header: 'Screenshot',
      cell: cell => {
        const img = cell.row.original.screenshot
        const title = cell.row.original.title
        return (
          <div>
            <Show when={img}>
              <HoverCard openDelay={150} closeDelay={0} content={<PreviewImage name={img!} />}>
                <img src={img!} alt={`Screenshot for post "${title}"`} class='border rounded h-full aspect-video w-32' />
              </HoverCard>
            </Show>
          </div>
        )
      },
    }),
    col.accessor('title', {
      header: 'Post',
      cell: cell => {
        const row = cell.row.original
        return (
          <RedditPostInfoCell
            variantId={row.id!}
            author={row.author!}
            permalink={row.permalink!}
            postId={row.postId!}
            subreddit={row.subreddit!}
            title={cell.getValue()!}
            createdAt={row.createdAt!}
            screenshotFilename={row.screenshot!}
          />
        )
      },
      size: Infinity,
    }),
    col.accessor('score', {
      header: 'Score',
      cell: StringCell,
    }),
    col.accessor('ratio', {
      header: 'Ratio',
      cell: StringCell,
    }),
    col.accessor('nrOfComments', {
      header: 'Comments',
      cell: StringCell,
    }),
    col.accessor('insertedAt', {
      header: 'Inserted',
      cell: DateCell,
    }),
  ]

  const table = createSolidTable<Variant>({
    columns,
    get data() {
      return props.variants
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div>
      <p class='p-2 bg-accent-50 rounded border border-accent-100 mb-2'>
        To add variants, go to{' '}
        <NavLink class='text-accent-500 underline decoration-dotted' href='/dashboard/reddit/detailed'>
          Aggregate data
        </NavLink>
        , search for posts you want to add, right click on the title of a post, click on "<em>View variants</em>", then for each
        variant you wish to add, right click and choose "<em>Add to survey</em>".
      </p>
      <Show when={!props.variants.length}>No variants.</Show>
      <Show when={props.variants.length}>
        <DataTable table={table} loading={false} error={false} size='auto' hideFooter={true} />
      </Show>
    </div>
  )
}
