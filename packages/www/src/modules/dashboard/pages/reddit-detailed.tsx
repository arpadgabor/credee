import { createQuery } from '@tanstack/solid-query'
import { createColumnHelper, createSolidTable, getCoreRowModel, getPaginationRowModel } from '@tanstack/solid-table'
import { Component } from 'solid-js'
import { createStore } from 'solid-js/store'
import { DataTable, DateCell, PageHeader, StringCell } from '../../../components/ui'
import { api } from '../../../utils/trpc'
import { Sparkline } from '../components/Sparkline'

const Page: Component = () => {
  const [pagination, setPagination] = createStore({
    pageIndex: 0,
    pageSize: 10,
  })

  const results = createQuery(() => ['detailed_reddit', pagination], {
    keepPreviousData: true,
    initialData: {
      meta: { count: 0 },
      data: [],
    },
    queryFn: () => {
      return api.reddit.redditByPostId.query({
        limit: pagination.pageSize,
        offset: pagination.pageIndex * pagination.pageSize,
      })
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

        return <Sparkline id={id} dataset={history} labelField='inserted_at' valueFields={['gold', 'score']} />
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
        description='This page contains aggregated data of the dataset. The posts are grouped by their ID.'
      />
      <DataTable table={table} loading={results.isLoading} error={results.isError} />
    </section>
  )
}

export default Page
