import { createMutation, createQuery } from '@tanstack/solid-query'
import {
  createColumnHelper,
  createSolidTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/solid-table'
import type { Component } from 'solid-js'
import { createStore } from 'solid-js/store'
import { Button, DataTable, DateCell, FormRow, Input, StringCell } from '../../../components/ui'
import { api } from '../../../utils/trpc'
import { createForm, Form, Field, required } from '@modular-forms/solid'

type JobForm = {
  subreddit: string
  stopsAfterCount: number
}

const Overview: Component = () => {
  const [state, setState] = createStore({
    subreddit: '/r/science',
    stopsAfterCount: 5,
  })

  const jobForm = createForm<JobForm>({
    initialValues: {
      subreddit: '/r/science',
      stopsAfterCount: 5,
    },
  })
  const jobs = createQuery(() => ['jobs'], {
    queryFn: () => api.jobs.list.query(),
    initialData: [],
  })
  const crawl = createMutation(
    async (input: JobForm) => {
      return await api.jobs.redditCrawl.mutate(input)
    },
    {
      onSuccess() {
        jobs.refetch()
      },
    }
  )

  async function onSubmit(values: JobForm) {
    await crawl.mutateAsync(values)
  }

  type Job = NonNullable<typeof jobs['data']>[number]

  const col = createColumnHelper<Job>()
  const table = createSolidTable<Job>({
    get data() {
      return jobs.data
    },
    columns: [
      col.accessor('id', {
        header: 'Id',
        cell: StringCell,
        sortDescFirst: true,
        size: 24,
      }),
      col.accessor('subreddit', {
        header: 'Subreddit',
        cell: StringCell,
      }),
      col.accessor('state', {
        cell: StringCell,
      }),
      col.accessor('createdAt', {
        header: 'Created at',
        cell: DateCell,
      }),
      col.accessor('startedAt', {
        header: 'Started at',
        cell: DateCell,
      }),
      col.accessor('completedAt', {
        header: 'Completed at',
        cell: DateCell,
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
  table.setPageSize(15)

  return (
    <div>
      <Form of={jobForm} onSubmit={onSubmit} class='flex space-x-4 mb-4'>
        <FormRow>
          <Field of={jobForm} name='subreddit' validate={[required('Field is required.')]}>
            {f => <Input {...f.props} value={f.value} type='text' placeholder='/r/' />}
          </Field>

          <Field of={jobForm} name='stopsAfterCount'>
            {f => <Input {...f.props} value={f.value} type='number' placeholder='Posts to scrape (5)' class='w-20' />}
          </Field>

          <Button type='submit' theme='main' disabled={crawl.isLoading}>
            Crawl
            <IconPhFileSearch class='ml-2' />
          </Button>
        </FormRow>
      </Form>

      <DataTable table={table} loading={jobs.isLoading} error={jobs.isError} />
    </div>
  )
}

export default Overview
