import { createForm, createFormStore, Field, Form, required, setValue } from '@modular-forms/solid'
import { createMutation, createQuery } from '@tanstack/solid-query'
import {
  createColumnHelper,
  createSolidTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
} from '@tanstack/solid-table'
import { Component, For, Match, Switch } from 'solid-js'
import IconSearch from '~icons/lucide/search'
import { Button, DataTable, DateCell, FormRow, Input, PageHeader, StringCell } from '../../../components/ui'
import { api } from '../../../utils/trpc'
import { Show } from 'solid-js'
import { update } from 'lodash-es'

type JobForm = {
  subreddit: string
  stopsAfterCount: number
  every: number
}

const Overview: Component = () => {
  const jobForm = createFormStore<JobForm>({
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
            <Field of={jobForm} type='string' name='subreddit' validate={[required('Field is required.')]}>
              {(f, props) => <Input {...props} value={f.value} type='text' placeholder='/r/' />}
            </Field>

            <Field of={jobForm} type='number' name='stopsAfterCount'>
              {(f, props) => <Input {...props} value={f.value} type='number' placeholder='Posts to scrape (5)' class='w-20' />}
            </Field>

            <Field of={jobForm} type='number' name='every'>
              {(f, props) => <Input {...props} value={f.value} type='number' step={1} placeholder='Every (M)' class='w-40' />}
            </Field>

            <Button type='submit' theme='main' disabled={crawl.isLoading}>
              Crawl
              <IconSearch class='ml-2' />
            </Button>
          </FormRow>
        </Form>
        <Button onClick={() => jobs.refetch()}>Refresh</Button>
      </div>

      <div class='flex gap-4'>
        <div class='w-3/4'>
          <DataTable size={'auto'} table={table} loading={jobs.isLoading} error={jobs.isError} />
        </div>

        <div class='w-1/4 border rounded border-gray-200 p-4'>
          <Updater />
        </div>
      </div>
    </div>
  )
}

function Updater() {
  const [form, { Field, Form }] = createForm<{ repeat: number; maxDays: number; maxScrapes: number }>({
    initialValues: {
      repeat: 0,
      maxDays: 3,
      maxScrapes: 36,
    },
  })

  const updater = createQuery(() => ['updater'], {
    refetchInterval(data) {
      if (data?.isRunning) return 1000
      const waitFor = data?.job?.next ? data?.job?.next - Date.now() : 0
      return waitFor
    },
    queryFn: () => api.jobs.getUpdater.query(),
    onSettled(data) {
      if (!data?.job) return
      setValue(form, 'repeat', Number(data?.job?.pattern) / 1000 / 60)
      // setValue(form, 'maxScrapes', Number(data?.job?.) / 1000 / 60)
    },
  })

  const setUpdater = createMutation({
    mutationFn: async (input: { repeat: number }) => {
      return api.jobs.setUpdaterInterval.mutate({
        repeatMinutes: input.repeat,
      })
    },
    onSuccess() {
      updater.refetch()
    },
  })

  const onSubmit = (value: { repeat: number }) => {
    setUpdater.mutate(value)
  }

  return (
    <div class='flex flex-col h-full'>
      <h2 class='font-bold text-lg'>Updater job</h2>
      <p class='mb-8 text-gray-600'>
        This job handles re-scraping posts for time-series data of the progress in time of a post.
      </p>

      <Form onSubmit={onSubmit} class='mb-4 space-y-2 flex flex-col'>
        <Field name='repeat' type='number'>
          {(f, props) => (
            <label class='flex-1 w-full'>
              <p class='font-bold mb-1'>Interval in minutes</p>
              <Input {...props} value={f.value} type='number' class='w-full' />
            </label>
          )}
        </Field>
        <Field name='maxDays' type='number'>
          {(f, props) => (
            <label class='flex-1 w-full'>
              <p class='font-bold mb-1'>Max age of post</p>
              <Input {...props} value={f.value} type='number' class='w-full' />
            </label>
          )}
        </Field>
        <Field name='maxScrapes' type='number'>
          {(f, props) => (
            <label class='flex-1 w-full'>
              <p class='font-bold mb-1'>Max number of scrapes for a post</p>
              <Input {...props} value={f.value} type='number' class='w-full' />
            </label>
          )}
        </Field>
        <Button disabled={setUpdater.isLoading} theme='accent'>
          Save
        </Button>
      </Form>

      <Show when={updater.data?.job}>
        <dl class='flex flex-col space-y-2 mb-4'>
          <div>
            <dd class='font-bold mb-1'>Next run:</dd>
            <dt>{new Date(updater.data!.job!.next).toLocaleString()}</dt>
          </div>

          <div>
            <dd class='font-bold mb-1'>Status</dd>
            <dt class='flex'>
              {updater.data?.isRunning ? (
                <div class='h-8 px-2 flex items-center bg-green-100 rounded-full'>Running</div>
              ) : (
                <div class='h-8 px-2 flex items-center bg-gray-100 rounded-full'>Waiting</div>
              )}
            </dt>
          </div>
        </dl>

        <p class='font-bold mb-1'>Logs for last 10 runs:</p>
        <div class='bg-gray-100 rounded border border-gray-300 max-h-96 overflow-auto divide-y-2 p-2'>
          <For each={updater.data?.logs}>
            {log => (
              <div class='py-2'>
                <For each={log.logs}>
                  {l => (
                    <p>
                      <code>{l}</code>
                    </p>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      </Show>
    </div>
  )
}

export default Overview
