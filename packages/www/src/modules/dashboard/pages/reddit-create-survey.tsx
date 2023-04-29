import { createFormStore, Field, Form, zodForm } from '@modular-forms/solid'
import { useNavigate } from '@solidjs/router'
import { createMutation } from '@tanstack/solid-query'
import { Show } from 'solid-js'
import { z } from 'zod'
import { Button, FieldAlert, FieldLabel, Input, PageHeader } from '../../../components/ui'
import { api } from '../../../utils/trpc'

const formValidator = z.object({
  title: z.string({ required_error: 'The title is required.' }).min(1, 'Please enter a title for the survey.'),
  redirectUrl: z.string().url(),
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
})

export default function RedditCreateSurvey() {
  const goTo = useNavigate()
  const submitForm = createFormStore({
    validate: zodForm(formValidator),
  })
  const createSurvey = createMutation({
    mutationFn: (data: z.infer<typeof formValidator>) => {
      return api.surveys.create.mutate({
        title: data.title,
        endsAt: data.endDate ? new Date(data.endDate) : undefined,
        redirectUrl: data.redirectUrl,
      })
    },
    onSuccess: survey => {
      goTo(`/dashboard/reddit/surveys/${survey.id}`)
    },
  })
  function onSubmit(data: z.infer<typeof formValidator>) {
    createSurvey.mutate(data)
  }

  return (
    <section>
      <PageHeader
        title='Create Survey'
        description='Start a new survey using reddit posts. It will be accessible at the URL:'
      />
      <div class='mt-0 mb-4'>
        <p class='bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border border-gray-200 dark:border-gray-700'>
          {location.protocol}//{location.hostname}/surveys/{'<id>'}
        </p>
      </div>

      <main>
        <Form of={submitForm} onSubmit={onSubmit} class='flex flex-col h-full space-y-4'>
          <div class='flex flex-col md:flex-row md:space-x-2'>
            <Field of={submitForm} name='title'>
              {(field, props) => (
                <label class='w-full md:w-3/4'>
                  <FieldLabel>Title</FieldLabel>
                  <Input {...props} class='w-full' />
                  <Show when={field.error}>
                    <FieldAlert type='error'>{field.error}</FieldAlert>
                  </Show>
                </label>
              )}
            </Field>

            <Field of={submitForm} name='redirectUrl'>
              {(field, props) => (
                <label class='w-full md:w-3/4'>
                  <FieldLabel>URL to redirect after finishing</FieldLabel>
                  <Input {...props} class='w-full' type='url' />
                  <Show when={field.error}>
                    <FieldAlert type='error'>{field.error}</FieldAlert>
                  </Show>
                </label>
              )}
            </Field>

            <Field of={submitForm} name='endDate'>
              {(field, props) => (
                <label class='w-full md:w-1/4'>
                  <FieldLabel>Deadline</FieldLabel>
                  <Input {...props} type='date' class='w-full' />
                  <Show when={field.error}>
                    <FieldAlert type='error'>{field.error}</FieldAlert>
                  </Show>
                </label>
              )}
            </Field>
          </div>

          <div class='flex-1 flex items-end'>
            <Button theme='main' disabled={createSurvey.isLoading}>
              Save
            </Button>
          </div>
        </Form>
      </main>
    </section>
  )
}
