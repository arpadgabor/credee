import { createMutation, createQuery } from '@tanstack/solid-query'
import {
  createColumnHelper,
  createSolidTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/solid-table'
import { Component, Switch, Match } from 'solid-js'
import { Button, DataTable, DateCell, FormRow, Input, StringCell } from '../../../components/ui'
import { api } from '../../../utils/trpc'
import { createForm, Form, Field, required } from '@modular-forms/solid'

type JobForm = {
  subreddit: string
  stopsAfterCount: number
}

const Overview: Component = () => {
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

  const remove = createMutation(
    async (input: { jobId: string }) => {
      return await api.jobs.remove.mutate(input)
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

  type Job = NonNullable<(typeof jobs)['data']>[number]

  const col = createColumnHelper<Job>()
  const table = createSolidTable<Job>({
    get data() {
      return jobs.data
    },
    columns: [
      col.accessor('state', {
        cell: cell => (
          <Switch>
            <Match when={cell.getValue() === 'completed'}>✅</Match>
            <Match when={cell.getValue() === 'failed'}>❌</Match>
            <Match when={cell.getValue() === 'active'}>⌛</Match>
          </Switch>
        ),
        header: '',
        size: 16,
      }),
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
      col.accessor('progress', {
        header: 'Progress',
        cell: cell => {
          const [done, total] = cell.getValue().split('/')

          return (
            <div class='flex items-center'>
              {cell.getValue()}
              <div class='h-2 w-full rounded relative bg-gray-100'>
                <div
                  class='absolute left-0 h-full rounded bg-green-500'
                  style={{ width: `${(Number(done) / Number(total)) * 100}%` }}
                ></div>
              </div>
            </div>
          )
        },
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
      col.display({
        id: 'actions',
        header: '',
        meta: {
          noStyle: true,
        },
        cell: cell => {
          return (
            <div>
              <Button
                size='sm'
                onClick={() => remove.mutateAsync({ jobId: cell.row.original.id! })}
                disabled={remove.isLoading}
              >
                Remove
              </Button>
            </div>
          )
        },
      }),
    ],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
  table.setPageSize(20)

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
