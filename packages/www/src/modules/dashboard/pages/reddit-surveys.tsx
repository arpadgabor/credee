import { createForm, Field, Form, reset as resetForm, zodForm } from '@modular-forms/solid'
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

const formValidator = z.object({
  title: z.string({ required_error: 'The title is required.' }).min(1, 'Please enter a title for the survey.'),
  endDate: z
    .string()
    .optional()
    .refine(
      value => {
        if (!value) return true
        const date = new Date(value)
        return date > new Date()
      },
      { message: 'The deadline must be at least 1 day in the future.' }
    ),
  posts: z.array(z.string()).min(5, 'Please select at leat 5 posts.'),
})

const Page: Component = () => {
  const submitForm = createForm({
    validate: zodForm(formValidator),
  })

  type Result = NonNullable<(typeof surveyList)['data']>['data'][number]
  const surveyList = createQuery(() => ['reddit_surveys'], {
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
        posts: data.posts,
      })
    },
    onSuccess: () => {
      surveyList.refetch()
      setPanelOpen(false)
      resetForm(submitForm)
    },
  })
  const [isPanelOpen, setPanelOpen] = createSignal<boolean>()
  function onSubmit(data: z.infer<typeof formValidator>) {
    createSurvey.mutate(data)
  }

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
              <FieldLabel>Title</FieldLabel>
              <Input {...field.props} class='w-full' />
              <Show when={field.error}>
                <FieldAlert type='error'>{field.error}</FieldAlert>
              </Show>
            </label>
          )}
        </Field>

        <Field of={submitForm} name='endDate'>
          {field => (
            <label class='w-full'>
              <FieldLabel>Deadline</FieldLabel>
              <Input {...field.props} type='date' class='w-full' />
              <Show when={field.error}>
                <FieldAlert type='error'>{field.error}</FieldAlert>
              </Show>
            </label>
          )}
        </Field>

        <PostsForSurveySelect form={submitForm} fieldName='posts' />

        <div class='flex-1 flex items-end'>
          <Button theme='main' disabled={createSurvey.isLoading}>
            Save
          </Button>
        </div>
      </Form>
    </Panel>
  )

  return (
    <section class='max-w-full'>
      <PageHeader title='Surveys' description='All surveys, running and old.' />

      <div class='flex mb-4'>
        <CreateSurveyPanel />
      </div>

      <DataTable table={table} loading={surveyList.isLoading} error={surveyList.isError} size='auto' hideFooter={true} />
    </section>
  )
}

export default Page
