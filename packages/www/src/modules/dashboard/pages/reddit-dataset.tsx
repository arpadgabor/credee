import { useSearchParams } from '@solidjs/router'
import { createQuery } from '@tanstack/solid-query'
import { createColumnHelper, createSolidTable, getCoreRowModel, getSortedRowModel, SortingState } from '@tanstack/solid-table'
import { Component } from 'solid-js'
import { createStore } from 'solid-js/store'
import { DataTable, DateCell, HoverCard, PageHeader, StringCell } from '../../../components/ui'
import { api } from '../../../utils/trpc'
import { PreviewImage, RedditPostInfoCell } from '../components/post-info-cell'
import { Show } from 'solid-js'

const Page: Component = () => {
  const [params] = useSearchParams()
  const [sorting, setSorting] = createStore<SortingState>([{ id: 'inserted_at', desc: true }])
  const [pagination, setPagination] = createStore({
    pageIndex: 0,
    pageSize: 15,
  })

  const results = createQuery(() => ['results_reddit', pagination, sorting, params.post_id], {
    keepPreviousData: true,
    initialData: {
      meta: { count: 0 },
      data: [],
    },
    queryFn: () => {
      return api.reddit.redditResults.query({
        postId: params.post_id,
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
    col.accessor('screenshot_filename', {
      header: 'Screenshot',
      cell: cell => {
        const img = cell.row.original.screenshot_filename
        const title = cell.row.original.title
        return (
          <div>
            <Show when={img}>
              <HoverCard openDelay={150} closeDelay={0} content={<PreviewImage name={img!} />}>
                <img src={img!} alt={`Screenshot for post "${title}"`} />
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
            variantId={row.id}
            author={row.author}
            permalink={row.permalink}
            postId={row.post_id}
            subreddit={row.subreddit}
            title={cell.getValue()}
            createdAt={row.created_at}
            screenshotFilename={row.screenshot_filename}
            onDelete={results.refetch}
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
      <PageHeader
        title={`All data [${results.data.meta.count}]`}
        description='This page contains the original dataset, all data that is scraped in a cut-down format, but no aggregation.'
      />
      <DataTable table={table} loading={results.isLoading} error={results.isError} size='auto' />
    </section>
  )
}

export default Page
