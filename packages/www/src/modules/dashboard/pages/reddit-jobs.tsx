import { createForm, Field, Form, required } from '@modular-forms/solid'
import { createMutation, createQuery } from '@tanstack/solid-query'
import {
  createColumnHelper,
  createSolidTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/solid-table'
import { Component, Match, Switch } from 'solid-js'
import IconSearch from '~icons/lucide/search'
import { Button, DataTable, DateCell, FormRow, Input, PageHeader, StringCell } from '../../../components/ui'
import { api } from '../../../utils/trpc'

type JobForm = {
  subreddit: string
  stopsAfterCount: number
  every: number
}

const Overview: Component = () => {
  const jobForm = createForm<JobForm>({
    initialValues: {
      subreddit: '/r/science',
      stopsAfterCount: 5,
      every: 60, // in minutes
    },
  })
  const jobs = createQuery(() => ['jobs'], {
    queryFn: () => api.jobs.list.query(),
    initialData: [],
  })
  const crawl = createMutation(
    async (input: JobForm) => {
      return await api.jobs.redditCrawl.mutate({
        ...input,
        repeat: {
          every: input.every * (60 * 1000), // in ms
        },
      })
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
  const columns = [
    // col.accessor('name', {
    //   cell: cell => (
    //     <Switch>
    //       <Match when={cell.getValue() === 'completed'}>✅</Match>
    //       <Match when={cell.getValue() === 'failed'}>❌</Match>
    //       <Match when={cell.getValue() === 'active'}>⌛</Match>
    //     </Switch>
    //   ),
    //   header: '',
    //   size: 32,
    // }),
    col.accessor('subreddit', {
      cell: StringCell,
      sortDescFirst: true,
      size: 32,
    }),
    col.accessor('next', {
      size: 128,
      cell: DateCell,
    }),
    col.accessor('pattern', {
      header: 'Repeats every',
      size: 128,
      cell: cell => <div>{Number(cell.getValue()) / (60 * 1000)}m</div>,
    }),
    col.display({
      id: 'actions',
      header: '',
      size: 0,
      meta: {
        noStyle: true,
      },
      cell: cell => (
        <div class='flex justify-end pr-1'>
          <Button size='sm' onClick={() => remove.mutateAsync({ jobId: cell.row.original.key! })} disabled={remove.isLoading}>
            Remove
          </Button>
        </div>
      ),
    }),
    // col.accessor('progress', {
    //   header: 'Progress',
    //   size: 256,
    //   meta: {
    //     noStyle: true,
    //   },
    //   cell: cell => {
    //     const [done, total] = cell.getValue().split('/')

    //     return (
    //       <div class='flex items-center justify-center relative px-3'>
    //         <span class='absolute mx-auto px-2 py-1 text-sm bg-white/75 rounded-full border border-green-500 z-10 backdrop-blur-sm'>
    //           {cell.getValue()}
    //         </span>
    //         <div class='h-2 w-full rounded relative bg-gray-100'>
    //           <div
    //             class='absolute left-0 h-full rounded bg-green-500'
    //             style={{ width: `${(Number(done) / Number(total)) * 100}%` }}
    //           ></div>
    //         </div>
    //       </div>
    //     )
    //   },
    // }),
  ]

  const table = createSolidTable<Job>({
    get data() {
      return jobs.data
    },
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  })
  table.setPageSize(20)

  return (
    <div>
      <PageHeader
        title='Crawl jobs'
        description='Here you can add a new crawl job for a subreddit. The scraped data will be available after completed on the Dataset page.'
      />
      <div class='flex justify-between items-center'>
        <Form of={jobForm} onSubmit={onSubmit} class='flex space-x-4 mb-4'>
          <FormRow>
            <Field of={jobForm} name='subreddit' validate={[required('Field is required.')]}>
              {f => <Input {...f.props} value={f.value} type='text' placeholder='/r/' />}
            </Field>

            <Field of={jobForm} name='stopsAfterCount'>
              {f => <Input {...f.props} value={f.value} type='number' placeholder='Posts to scrape (5)' class='w-20' />}
            </Field>
            <Field of={jobForm} name='every'>
              {f => <Input {...f.props} value={f.value} type='number' step={1} placeholder='Every (M)' class='w-40' />}
            </Field>

            <Button type='submit' theme='main' disabled={crawl.isLoading}>
              Crawl
              <IconSearch class='ml-2' />
            </Button>
          </FormRow>
        </Form>
        <Button onClick={() => jobs.refetch()}>Refresh</Button>
      </div>

      <DataTable size={'auto'} table={table} loading={jobs.isLoading} error={jobs.isError} />
    </div>
  )
}

export default Overview
