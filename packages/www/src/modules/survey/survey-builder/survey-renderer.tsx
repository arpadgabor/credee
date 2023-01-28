import { createForm, Field, Form, FormState, zodForm } from '@modular-forms/solid'
import { children, createEffect, For, Match, ParentComponent, Show, splitProps, Switch } from 'solid-js'
import { z } from 'zod'
import { Button } from '../../../components/ui'
import { Survey, SurveyField } from './survey.type'

interface Props {
  survey: Survey
  onSubmit: (values: any) => void
}

export function SurveyRenderer(props: Props) {
  const validationObject: Record<string, z.Schema> = props.survey.fields.reduce(
    (schema, field) => ({
      [field.id]: field.validator,
      ...schema,
    }),
    {}
  )
  const validationSchema = z.object(validationObject)

  const form = createForm<z.input<typeof validationSchema>>({
    validate: zodForm(validationSchema),
  })

  return (
    <Form of={form} onSubmit={props.onSubmit}>
      <h1 class='font-bold text-2xl mb-8'>{props.survey.title}</h1>

      <div class='flex flex-col space-y-8 mb-8'>
        <For each={props.survey.fields}>{field => <SurveyFieldMapper field={field} form={form} />}</For>
      </div>

      <div class='flex justify-end'>
        <Button type='submit' size='lg' theme='accent'>
          Submit!
        </Button>
      </div>
    </Form>
  )
}

const SurveyFieldMapper: ParentComponent<{ field: SurveyField; form: FormState<any> }> = props => {
  // @ts-expect-error typeName is a hidden property
  const zodFieldType: 'ZodNullable' | 'ZodOptional' = props.field.validator._def?.typeName
  const isOptional = ['ZodNullable', 'ZodOptional'].includes(zodFieldType)

  return (
    <Field of={props.form} name={props.field.id}>
      {f => (
        <fieldset class='flex flex-col p-0'>
          <legend class='font-semibold text-lg text-gray-800 mb-2'>{props.field.title}</legend>

          <Show when={props.field.description}>
            <p class='text-gray-600'>{props.field.description}</p>
          </Show>

          <div class='h-4'></div>

          <Switch>
            <Match when={props.field.type === 'short-text'}>
              <input
                type='text'
                {...f.props}
                id={f.name}
                value={f.value}
                required={!isOptional}
                class='h-12 px-3 flex items-center border rounded border-gray-300 bg-white shadow-sm hover:shadow transition'
              />
            </Match>
          </Switch>

          <Show when={f.error}>
            <div class='mt-2'>
              <p class='text-sm text-red-600'>{f.error}</p>
            </div>
          </Show>
        </fieldset>
      )}
    </Field>
  )
}
