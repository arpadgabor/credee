import { createMutation, createQuery } from '@tanstack/solid-query'
import { createColumnHelper, createTable, getCoreRowModel } from '@tanstack/solid-table'
import { Component } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Button, DataTable, FormRow, Input, StringCell } from '../../../components/ui'
import { api } from '../../../utils/trpc'

const Overview: Component = () => {
  const [state, setState] = createStore({
    subreddit: '/r/science',
    stopsAfterCount: 5,
  })

  const jobs = createQuery(() => ['jobs'], {
    queryFn: () => api.tasks.jobs.query(),
    initialData: [],
  })

  const crawl = createMutation(
    async () => {
      return await api.tasks.crawlSubreddit.mutate({
        subreddit: state.subreddit,
        stopsAfterCount: state.stopsAfterCount,
      })
    },
    {
      onSuccess() {
        jobs.refetch()
      },
    }
  )

  type Row = NonNullable<typeof jobs['data']>[number]

  const col = createColumnHelper<Row>()
  const table = createTable<Row>({
    get data() {
      return jobs.data
    },
    columns: [
      col.accessor('id', {
        header: 'Id',
        cell: StringCell,
        sortDescFirst: true,
      }),
      col.accessor('data.subreddit', {
        header: 'Subreddit',
        cell: StringCell,
      }),
      col.accessor('state', {
        cell: StringCell,
      }),
      col.accessor('createdAt', {
        cell: StringCell,
      }),
      col.accessor('startedAt', {
        cell: StringCell,
      }),
      col.accessor('completedAt', {
        cell: StringCell,
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
    state: {
      columnPinning: {},
      columnSizing: {},
    },
    onStateChange: () => {},
    renderFallbackValue: () => {},
  })

  return (
    <div class='p-8'>
      <form onSubmit={ev => (ev.preventDefault(), crawl.mutateAsync())} class='flex space-x-4 mb-4'>
        <FormRow>
          <Input
            type='text'
            name='subreddit'
            placeholder='/r/'
            required
            pattern={'/r/(.*)'}
            onInput={e => setState('subreddit', (e.target as HTMLInputElement).value)}
          />

          <Input
            type='number'
            name='stopsAfterCount'
            placeholder='Posts to scrape (5)'
            value={state.stopsAfterCount}
            onInput={e => setState('stopsAfterCount', Number((e.target as HTMLInputElement).value))}
            class='w-20'
          />

          <Button type='submit' theme='main'>
            Crawl
            <IconPhFileSearch class='ml-2' />
          </Button>
        </FormRow>
      </form>

      <DataTable table={table} loading={jobs.isLoading} error={jobs.isError} />
    </div>
  )
}

export default Overview
