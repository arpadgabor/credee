import { createQuery } from '@tanstack/solid-query'
import { createColumnHelper, createSolidTable, getCoreRowModel, getSortedRowModel, SortingState } from '@tanstack/solid-table'
import { Component, Match, Switch } from 'solid-js'
import { createStore } from 'solid-js/store'
import { DataTable, DateCell, HoverCard, StringCell } from '../../../components/ui'
import { api, uploadsPath } from '../../../utils/trpc'
import { RedditPostInfoCell } from '../components/RedditPostInfoCell'

const Page: Component = () => {
  const [sorting, setSorting] = createStore<SortingState>([{ id: 'inserted_at', desc: true }])
  const [pagination, setPagination] = createStore({
    pageIndex: 0,
    pageSize: 15,
  })

  const results = createQuery(() => ['results_reddit', pagination, sorting], {
    keepPreviousData: true,
    initialData: {
      meta: { count: 0 },
      data: [],
    },
    queryFn: () => {
      return api.jobs.redditResults.query({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
        order: sorting?.map(({ id, desc }) => ({
          column: id as any,
          sort: desc ? 'desc' : 'asc',
        })),
      })
    },
  })

  type Result = NonNullable<(typeof results)['data']>['data'][number]

  const col = createColumnHelper<Result>()
  const columns = [
    col.accessor('title', {
      header: 'Post',
      cell: cell => {
        const row = cell.row.original
        return (
          <RedditPostInfoCell
            author={row.author}
            permalink={row.permalink}
            postId={row.post_id}
            subreddit={row.subreddit}
            title={cell.getValue()}
            createdAt={row.created_at}
            screenshotFilename={row.screenshot_filename}
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
      cell: DateCell,
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
      get sorting() {
        return sorting
      },
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    get pageCount() {
      return results.data.meta.count ? Math.ceil(results.data.meta.count / pagination.pageSize) : 0
    },
  })

  return (
    <section class='max-w-full'>
      <DataTable table={table} loading={results.isLoading} error={results.isError} size='auto' />
    </section>
  )
}

export default Page
