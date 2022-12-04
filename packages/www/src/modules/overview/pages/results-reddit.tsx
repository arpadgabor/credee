import { createQuery } from '@tanstack/solid-query'
import {
  createColumnHelper,
  createSolidTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/solid-table'
import { Component, createEffect, createMemo, createSignal } from 'solid-js'
import { createStore } from 'solid-js/store'
import { DataTable, StringCell } from '../../../components/ui'
import { api } from '../../../utils/trpc'

const Page: Component = () => {
  const [pagination, setPagination] = createStore({
    pageIndex: 0,
    pageSize: 10,
  })

  const results = createQuery(() => ['results_reddit', pagination], {
    queryFn: () =>
      api.jobs.redditResults.query({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
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
      col.accessor('post_id', {
        header: 'Post id',
        cell: StringCell,
        size: 128,
      }),
      col.accessor('title', {
        header: 'Title',
        cell: StringCell,
        size: 726,
      }),
      col.accessor('subreddit', {
        header: 'Subreddit',
        cell: StringCell,
      }),
      col.accessor('author', {
        cell: StringCell,
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
      col.accessor('permalink', {
        header: 'Permalink',
        cell: cell => (
          <a href={cell.getValue()} class='text-blue-500 underline' target='_blank'>
            Permalink
          </a>
        ),
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
    state: {
      pagination,
    },
    pageCount: results.data.meta.count ? Math.ceil(results.data.meta.count / pagination.pageSize) : 0,
    manualPagination: true,
    onPaginationChange: setPagination,
  })

  return (
    <section class='max-w-full'>
      <DataTable table={table} loading={results.isLoading} error={results.isError} size='auto' />
    </section>
  )
}

export default Page
