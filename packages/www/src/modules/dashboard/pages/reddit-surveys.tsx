import { createForm, Field, Form, reset as resetForm, zodForm } from '@modular-forms/solid'
import { createMutation, createQuery } from '@tanstack/solid-query'
import { createColumnHelper, createSolidTable, getCoreRowModel, getSortedRowModel } from '@tanstack/solid-table'
import { Component, createSignal } from 'solid-js'
import { z } from 'zod'
import IconAdd from '~icons/lucide/file-plus'
import { Button, DataTable, DateCell, Input, PageHeader, Panel, StringCell } from '../../../components/ui'
import { api } from '../../../utils/trpc'

const formValidator = z.object({
  title: z.string(),
  endDate: z.string().optional(),
})

const Page: Component = () => {
  const results = createQuery(() => ['reddit_surveys'], {
    keepPreviousData: true,
    queryFn: () => {
      return api.surveys.list.query()
    },
  })
  const createSurvey = createMutation({
    mutationFn: (data: z.infer<typeof formValidator>) => {
      return api.surveys.create.mutate({
        title: data.title,
        endsAt: data.endDate ? new Date(data.endDate) : undefined,
      })
    },
    onSuccess: () => results.refetch(),
  })

  type Result = NonNullable<(typeof results)['data']>['data'][number]

  const col = createColumnHelper<Result>()
  const columns = [
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
  ]

  const table = createSolidTable<Result>({
    columns,
    get data() {
      return results.data?.data ?? []
    },
    manualPagination: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  })

  const submitForm = createForm({
    validate: zodForm(formValidator),
  })
  const [isPanelOpen, setPanelOpen] = createSignal<boolean>()
  function onSubmit(data: z.infer<typeof formValidator>) {
    createSurvey.mutate(data)
    setPanelOpen(false)
    resetForm(submitForm)
  }

  const PanelTrigger = (
    <Button>
      <IconAdd class='mr-2 text-gray-600' />
      New Survey
    </Button>
  )

  const CreateSurveyPanel = () => (
    <Panel
      title='New Survey'
      trigger={PanelTrigger}
      description={
        <>
          <p>Start a new survey using reddit posts. It will be accessible at the URL:</p>
          <div class='mt-2'>
            <p class='bg-gray-100 px-3 py-2 rounded border border-gray-200'>
              {location.protocol}//{location.hostname}/surveys/{'<id>'}
            </p>
          </div>
        </>
      }
      isOpen={isPanelOpen()}
      onOpen={setPanelOpen}
    >
      <Form of={submitForm} onSubmit={onSubmit} class='flex flex-col h-full space-y-8'>
        <Field of={submitForm} name='title'>
          {field => (
            <label class='w-full'>
              <p>Title</p>
              <Input {...field.props} class='w-full' />
            </label>
          )}
        </Field>

        <Field of={submitForm} name='endDate'>
          {field => (
            <label class='w-full'>
              <p>Deadline</p>
              <Input {...field.props} type='date' class='w-full' />
            </label>
          )}
        </Field>

        <div class='flex-1 h-full'></div>

        <Button theme='main' disabled={createSurvey.isLoading}>
          Save
        </Button>
      </Form>
    </Panel>
  )

  return (
    <section class='max-w-full'>
      <PageHeader title='Surveys' description='All surveys, running and old.' />

      <div class='flex mb-4'>
        <CreateSurveyPanel />
      </div>

      <DataTable table={table} loading={results.isLoading} error={results.isError} size='auto' hideFooter={true} />
    </section>
  )
}

export default Page
