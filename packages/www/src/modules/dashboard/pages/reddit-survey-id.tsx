import { useParams } from '@solidjs/router'
import { createQuery } from '@tanstack/solid-query'
import { stringify as toCsv } from 'csv-stringify/browser/esm/sync'
import { Match, Show, Switch, createMemo, createSignal, onMount } from 'solid-js'

import { createColumnHelper, createSolidTable, getCoreRowModel } from '@tanstack/solid-table'
import { Button, DataTable, DateCell, PageHeader, StringCell, Tabs } from '../../../components/ui'

import DownloadIcon from '~icons/ph/download'
import { Outputs } from '@credee/api'
import { api } from '../../../utils/trpc'

import Survey from '../../survey/pages/survey'
import { RedditPostInfoCell } from '../components/post-info-cell'
type Survey = Outputs['surveys']['getByIdDetailed']
type Answer = Survey['answers'][number]
type Variant = Survey['variants'][number]

export default function RedditSurveyId() {
  const params = useParams<{ id: string }>()

  const survey = createQuery<Survey>(() => [params.id], {
    queryFn() {
      return api.surveys.getByIdDetailed.query({
        surveyId: Number(params.id),
      })
    },
  })

  const answers = createMemo(() => survey.data?.answers || [])
  const variants = createMemo(() => survey.data?.variants || [])

  return (
    <Switch>
      <Match when={survey.isLoading}>Loading</Match>
      <Match when={survey.isSuccess && survey.data}>
        <section>
          <PageHeader
            title={survey.data!.title}
            description={
              <div>
                <div>{survey.data!.deadline?.toISOString() || 'No deadline'}</div>
                <div>
                  URL for testing:{' '}
                  <code>
                    {location.origin}/surveys/{params.id}?referrer=custom
                  </code>
                </div>
              </div>
            }
          />

          <main>
            <Tabs
              ariaLabel='Survey Detail Tabs'
              tabs={[
                {
                  content: <SurveyResponses answers={answers()} />,
                  name: 'Responses',
                },
                {
                  content: <SurveyDataset variants={variants()} />,
                  name: 'Dataset',
                },
              ]}
            />
          </main>
        </section>
      </Match>
    </Switch>
  )
}

function SurveyResponses(props: { answers: Answer[] }) {
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
      <div class='flex mb-2'>
        <Show when={csvDownloadHref()}>
          <a href={csvDownloadHref()!} download={'Responses.csv'}>
            <Button type='button' tabIndex={-1}>
              <DownloadIcon class='mr-3' />
              Download Responses CSV
            </Button>
          </a>
        </Show>
      </div>
      <DataTable table={table} loading={false} error={false} size='auto' hideFooter={true} />
    </div>
  )
}

function SurveyDataset(props: { variants: Variant[] }) {
  const col = createColumnHelper<Variant>()
  const columns = [
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
      <Show when={!props.variants.length}>No variants.</Show>
      <Show when={props.variants.length}>
        <DataTable table={table} loading={false} error={false} size='auto' hideFooter={true} />
      </Show>
    </div>
  )
}
