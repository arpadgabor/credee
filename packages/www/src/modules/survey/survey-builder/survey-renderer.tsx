import { createForm, Field, Form, zodForm } from '@modular-forms/solid'
import { For } from 'solid-js'
import { z } from 'zod'
import { Survey } from './survey.type'

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
      <h1>{props.survey.title}</h1>
      <For each={props.survey.fields}>
        {field => (
          <Field of={form} name={field.id}>
            {f => <div>{f.name}</div>}
          </Field>
        )}
      </For>
    </Form>
  )
}
