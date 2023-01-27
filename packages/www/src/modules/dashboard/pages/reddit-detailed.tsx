import { createQuery } from '@tanstack/solid-query'
import { createColumnHelper, createSolidTable, getCoreRowModel, getSortedRowModel, SortingState } from '@tanstack/solid-table'
import { Component, Match, Switch } from 'solid-js'
import { createStore } from 'solid-js/store'
import { DataTable, DateCell, HoverCard, PageHeader, StringCell } from '../../../components/ui'
import { api, uploadsPath } from '../../../utils/trpc'
import { RedditPostInfoCell } from '../components/RedditPostInfoCell'

const Page: Component = () => {
  const [sorting, setSorting] = createStore<SortingState>([{ id: 'inserted_at', desc: true }])
  const [pagination, setPagination] = createStore({
    pageIndex: 0,
    pageSize: 15,
  })

  const results = createQuery(() => ['detailed_reddit', pagination, sorting], {
    keepPreviousData: true,
    initialData: {
      meta: { count: 0 },
      data: [],
    },
    queryFn: () => {
      return api.jobs.redditByPostId.query()
      // limit: pagination.pageSize,
      // offset: pagination.pageIndex * pagination.pageSize,
      // order: sorting?.map(({ id, desc }) => ({
      //   column: id as any,
      //   sort: desc ? 'desc' : 'asc',
      // })),
      // })
    },
  })

  type Result = NonNullable<(typeof results)['data']>['data'][number]

  const col = createColumnHelper<Result>()
  const columns = [
    col.accessor('post_id', {
      header: 'Post id',
      cell: StringCell,
      size: 64,
    }),
    col.accessor('title', {
      header: 'Title',
      cell: StringCell,
      size: 512,
    }),
    col.accessor('score', {
      header: 'Score',
      cell: StringCell,
      size: 64,
    }),
    col.accessor('flair', {
      header: 'Flair',
      cell: StringCell,
      size: 64,
    }),
    col.accessor('gold_count', {
      header: 'Award count',
      cell: StringCell,
      size: 64,
    }),
    col.accessor('scrape_count', {
      header: 'Scrape count',
      cell: StringCell,
      size: 64,
    }),
    col.accessor('inserted_at', {
      header: 'Last scrape',
      cell: DateCell,
    }),
  ]

  const table = createSolidTable<Result>({
    columns,
    get data() {
      return results.data?.data
    },
    // state: {
    //   get pagination() {
    //     return pagination
    //   },
    //   get sorting() {
    //     return sorting
    //   },
    // },
    // manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    // getSortedRowModel: getSortedRowModel(),
    // onPaginationChange: setPagination,
    // onSortingChange: setSorting,
    // get pageCount() {
    //   return results.data.meta.count ? Math.ceil(results.data.meta.count / pagination.pageSize) : 0
    // },
  })

  return (
    <section class='max-w-full'>
      <PageHeader
        title='Detailed data'
        description='This page contains aggregated data of the dataset. The posts are grouped by their ID.'
      />
      <DataTable table={table} loading={results.isLoading} error={results.isError} />
    </section>
  )
}

export default Page
