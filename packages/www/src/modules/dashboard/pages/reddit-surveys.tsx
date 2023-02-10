import { createForm, Field, Form, reset as resetForm, zodForm } from '@modular-forms/solid'
import { useNavigate } from '@solidjs/router'
import { createMutation, createQuery } from '@tanstack/solid-query'
import { createColumnHelper, createSolidTable, getCoreRowModel, getSortedRowModel } from '@tanstack/solid-table'
import { Component, createSignal, Show } from 'solid-js'
import { z } from 'zod'
import IconAdd from '~icons/lucide/file-plus'
import {
  Button,
  DataTable,
  DateCell,
  FieldAlert,
  FieldLabel,
  Input,
  PageHeader,
  Panel,
  StringCell,
} from '../../../components/ui'
import { api } from '../../../utils/trpc'
import { PostsForSurveySelect } from '../components/survey-post-select'

const Page: Component = () => {
  const goTo = useNavigate()
  type Result = NonNullable<(typeof surveyList)['data']>['data'][number]
  const surveyList = createQuery(() => ['reddit_surveys'], {
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
        size: 64,
        cell: StringCell,
      }),
      col.accessor('title', {
        header: 'Title',
        cell: StringCell,
      }),
      col.accessor('endsAt', {
        header: 'Deadline',
        cell: DateCell,
      }),
    ],
    get data() {
      return surveyList.data?.data ?? []
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
