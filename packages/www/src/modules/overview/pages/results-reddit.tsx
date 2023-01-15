import { createQuery } from '@tanstack/solid-query'
import { createColumnHelper, createSolidTable, getCoreRowModel, getSortedRowModel, SortingState } from '@tanstack/solid-table'
import { Component, createEffect } from 'solid-js'
import { createStore } from 'solid-js/store'
import { DataTable, DateCell, StringCell } from '../../../components/ui'
import { api } from '../../../utils/trpc'

const Page: Component = () => {
  const [sorting, setSorting] = createStore<SortingState>([])
  const [pagination, setPagination] = createStore({
    pageIndex: 0,
    pageSize: 12,
  })

  createEffect(() => {
    console.log(sorting)
  })

  const results = createQuery(() => ['results_reddit', pagination, sorting], {
    queryFn: () =>
      api.jobs.redditResults.query({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        order: sorting?.map(({ id, desc }) => ({
          column: id as any,
          sort: desc ? 'desc' : 'asc'
        }))
      }),
    keepPreviousData: true,
    initialData: {
      meta: { count: 0 },
      data: [],
    },
  })

  type Result = NonNullable<typeof results['data']>['data'][number]

  const col = createColumnHelper<Result>()
  const table = createSolidTable<Result>({
    get data() {
      return results.data?.data
    },
    columns: [
      col.accessor('title', {
        header: 'Post',
        cell: cell => {
          const row = cell.row.original
          return (
            <PostInfoCell
              author={row.author}
              permalink={row.permalink}
              postId={row.post_id}
              subreddit={row.subreddit}
              title={cell.getValue()}
              createdAt={row.created_at}
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
      col.accessor('nr_of_comments', {
        header: 'Comments',
        cell: StringCell,
      }),
      col.accessor('inserted_at', {
        header: 'Inserted',
        cell: DateCell
      })
    ],
    getCoreRowModel: getCoreRowModel(),
    state: {
      get pagination() { return pagination },
      get sorting() { return sorting }
    },
    onPaginationChange: setPagination,
    onSortingChange: (data) => {
      console.log('set sort')
      setSorting(data)
    },
    getSortedRowModel: getSortedRowModel(),
    get pageCount() {
      return results.data.meta.count ? Math.ceil(results.data.meta.count / pagination.pageSize) : 0
    },
    manualPagination: true,
  })

  return (
    <section class='max-w-full'>
      <DataTable table={table} loading={results.isLoading} error={results.isError} size='auto' />
    </section>
  )
}

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'short',
  timeStyle: 'short',
})

function PostInfoCell(row: {
  postId: string
  permalink: string
  subreddit: string
  author: string
  title: string
  createdAt: string | Date
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

      <p>{row.title}</p>
    </div>
  )
}

export default Page
