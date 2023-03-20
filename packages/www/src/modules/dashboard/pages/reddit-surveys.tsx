import { Component } from 'solid-js'
import { useNavigate } from '@solidjs/router'
import { createQuery } from '@tanstack/solid-query'
import { createColumnHelper, createSolidTable, getCoreRowModel, getSortedRowModel } from '@tanstack/solid-table'

import IconAdd from '~icons/lucide/file-plus'

import { api } from '../../../utils/trpc'
import { Button, ButtonLink, DataTable, DateCell, PageHeader, StringCell } from '../../../components/ui'

const Page: Component = () => {
  const goTo = useNavigate()
  type Result = NonNullable<(typeof surveyList)['data']>['data'][number]
  const surveyList = createQuery(() => ['reddit_surveys'], {
    initialData: {
      data: [],
      meta: {},
    },
    keepPreviousData: true,
    queryFn: () => {
      return api.surveys.list.query()
    },
  })

  const col = createColumnHelper<Result>()
  const table = createSolidTable<Result>({
    columns: [
      col.accessor('id', {
        header: 'ID',
        size: 32,
        cell: StringCell,
      }),
      col.accessor('title', {
        header: 'Title',
        cell: StringCell,
        size: 900,
      }),
      col.display({
        id: 'url',
        header: 'URL',
        cell: cell => (
          <a class='underline decoration-dotted text-accent-500' href={`${location.origin}/survey/${cell.row.original.id}`}>
            Access link
          </a>
        ),
      }),
      col.accessor('endsAt', {
        header: 'Deadline',
        cell: DateCell,
        size: 128,
      }),
      col.display({
        id: 'view',
        header: 'Details',
        cell: cell => {
          return (
            <ButtonLink size={'sm'} href={String(cell.row.original.id)}>
              Details
            </ButtonLink>
          )
        },
        size: 128,
      }),
    ],
    get data() {
      return surveyList.data?.data
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  return (
    <section class='max-w-full'>
      <PageHeader title='Surveys' description='All surveys, running and old.' />

      <div class='flex mb-4'>
        <Button onClick={() => goTo('create')}>
          <IconAdd class='mr-2 text-gray-600' />
          New Survey
        </Button>
      </div>

      <DataTable table={table} loading={surveyList.isLoading} error={surveyList.isError} size='auto' hideFooter={true} />
    </section>
  )
}

export default Page
