import { createQuery } from '@tanstack/solid-query'
import { createColumnHelper, createSolidTable, getCoreRowModel, getPaginationRowModel } from '@tanstack/solid-table'
import { Component } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Button, DataTable, DateCell, Input, PageHeader, Select, StringCell } from '../../../components/ui'
import { api } from '../../../utils/trpc'
import { PostTags } from '../components/post-tags'
import { Sparkline } from '../components/sparkline'

const sparklineColors = {
  gold: '#FCAB10',
  score: '#000000',
  comments: '#84DCCF',
  ratio: '#aaaaaa',
  inserted_at: '',
} as const

const Page: Component = () => {
  const [pagination, setPagination] = createStore({
    pageIndex: 0,
    pageSize: 25,
  })
  const [filterBy, setFilter] = createStore({
    subreddit: '' as string,
    flair: '' as string,
    title: '' as string,
  })
  function clearFilters() {
    setFilter('flair', '')
    setFilter('subreddit', '')
    setFilter('title', '')
  }

  const filters = createQuery(() => ['detailed_reddit_fitlers'], {
    queryFn: async () => {
      return await api.reddit.redditFilters.query()
    },
  })
  const subreddits = () => [{ label: 'Any', value: '' }, ...(filters.data?.subreddits.map(s => ({ label: s, value: s })) ?? [])]
  const flairs = () => [{ label: 'Any', value: '' }, ...(filters.data?.flairs.map(s => ({ label: s, value: s })) ?? [])]

  const results = createQuery(() => ['detailed_reddit', pagination, filterBy], {
    keepPreviousData: true,
    initialData: {
      meta: { count: 0 },
      data: [],
    },
    queryFn: () => {
      return api.reddit.redditByPostId.query({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        flair: filterBy.flair || undefined,
        subreddit: filterBy.subreddit || undefined,
        title: filterBy.title,
      })
    },
  })

  type Result = NonNullable<(typeof results)['data']>['data'][number]

  const col = createColumnHelper<Result>()
  const columns = [
    col.accessor('title', {
      header: 'Post',
      cell: cell => {
        const post = cell.row.original
        return (
          <div class='flex flex-col'>
            <div class='flex space-x-2 text-xs text-gray-500 mb-1'>
              <span>
                {post.subreddit}/{post.post_id}
              </span>
            </div>
            <p class='mb-2'>{cell.getValue()}</p>
            <PostTags post={post} />
          </div>
        )
      },
      size: 700,
    }),
    col.accessor('created_at', {
      header: 'Posted at',
      cell: DateCell,
      size: 128,
    }),
    col.accessor('flair', {
      header: 'Flair',
      cell: StringCell,
      size: 64,
    }),
    col.accessor('history', {
      header: 'Score history',
      size: 196,
      cell: cell => {
        const id = cell.row.original.post_id
        const history = cell.getValue().map(item => ({
          ...item,
          inserted_at: new Date(item.inserted_at),
        }))

        return (
          <Sparkline
            id={id}
            dataset={history}
            labelField='inserted_at'
            valueFields={['gold', 'score', 'comments', 'ratio']}
            colors={sparklineColors}
          />
        )
      },
    }),
  ]

  const table = createSolidTable<Result>({
    columns,
    get data() {
      return results.data?.data
    },
    state: {
      get pagination() {
        return pagination
      },
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    enableSorting: false,
    get pageCount() {
      return results.data.meta.count ? Math.ceil(results.data.meta.count / pagination.pageSize) : 0
    },
  })

  return (
    <section class='max-w-full'>
      <PageHeader
        title='Detailed data'
        description={
          <>
            <span>This page contains aggregated data of the dataset. The posts are grouped by their ID. </span>
            <span>({results.data?.meta?.count} results)</span>
          </>
        }
      />
      <div class='flex mb-2 flex-row gap-2'>
        <Select
          options={subreddits()}
          value={filterBy.subreddit}
          label='Subreddits'
          name='subreddits'
          class='w-64'
          placeholder='Select subreddit'
          onSelect={e => setFilter('subreddit', e)}
        />
        <Select
          options={flairs()}
          value={filterBy.flair}
          label='Flair'
          name='flair'
          class='w-64'
          placeholder='Select flair'
          onSelect={e => setFilter('flair', e)}
        />
        <Input placeholder='Search by title' onInput={e => setFilter('title', e.currentTarget.value)} value={filterBy.title} />
        <Button theme='ghost' onClick={clearFilters}>
          Clear
        </Button>
      </div>
      <DataTable table={table} loading={results.isLoading} error={results.isError} />
    </section>
  )
}

export default Page
