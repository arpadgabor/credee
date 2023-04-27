import { For, JSX, Match, ParentComponent, Show, Switch } from 'solid-js'
import { cx } from 'class-variance-authority'
import { z } from 'zod'

import { createForm, Field, Form, FormState, zodForm } from '@modular-forms/solid'
import { Alert, Image } from '@kobalte/core'

import { Button } from '../../../components/ui'
import { FieldMultiSelect } from './fields/multi-select'
import { FieldScale } from './fields/scale'
import { FieldShortText } from './fields/short-text'
import { FormData, FormField, FormFields, Media } from './form.type'
import { FieldNumber } from './fields/number'
import { FieldDropdown } from './fields/dropdown'

interface Props {
  survey: FormData
  loading?: boolean
  submitLabel?: string | JSX.Element
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
      <div class='flex flex-col space-y-4 mb-8'>
        <For each={props.survey.fields}>{field => <FormFieldMapper formField={field} form={form} />}</For>
      </div>

      <div class='flex justify-end'>
        <Button type='submit' theme='accent' disabled={props.loading}>
          {props.submitLabel || 'Submit'}
        </Button>
      </div>
    </Form>
  )
}

const FormFieldMapper: ParentComponent<{ formField: FormField; form: FormState<any> }> = $ => {
  // @ts-expect-error typeName is a hidden property
  const zodFieldType: 'ZodNullable' | 'ZodOptional' = $.formField.validator._def?.typeName
  const isOptional = ['ZodNullable', 'ZodOptional'].includes(zodFieldType)

  return (
    <Field of={$.form} name={$.formField.id}>
      {field => (
        <fieldset
          class={cx(
            'flex flex-col p-4 md:p-8 !pt-0 rounded-lg border border-gray-200 dark:border-gray-800',
            field.error
              ? 'border-red-200 dark:border-red-900 bg-gradient-to-b from-red-100 dark:from-red-900 via-white dark:via-gray-900'
              : ''
          )}
        >
          <legend class='font-semibold text-lg text-gray-800 dark:text-white mb-2 backdrop:blur-xl px-2 -ml-2'>
            <label id={`${field.name}-label`} for={field.name} class='pt-8'>
              {$.formField.title}
            </label>
          </legend>

          <Show when={$.formField.description}>
            <p id={`${field.name}-description`} class='text-gray-600 dark:text-gray-400'>
              {$.formField.description}
            </p>
          </Show>

          <Show when={$.formField.media}>
            <div class='h-4'></div>
            <FormMedia media={$.formField.media!} />
          </Show>

          <div class='h-4'></div>

          <Switch fallback={<p>Could not render field.</p>}>
            <Match when={$.formField.type === 'short-text'}>
              <FieldShortText
                form={$.form}
                field={field}
                formField={$.formField as FormFields['short-text']}
                required={!isOptional}
              />
            </Match>

            <Match when={$.formField.type === 'number'}>
              <FieldNumber
                form={$.form}
                field={field}
                formField={$.formField as FormFields['short-text']}
                required={!isOptional}
              />
            </Match>

            <Match when={$.formField.type === 'scale'}>
              <FieldScale form={$.form} field={field} formField={$.formField as FormFields['scale']} required={!isOptional} />
            </Match>

            <Match when={$.formField.type === 'multi-select'}>
              <FieldMultiSelect
                form={$.form}
                field={field}
                formField={$.formField as FormFields['multi-select']}
                required={!isOptional}
              />
            </Match>

            <Match when={$.formField.type === 'dropdown'}>
              <FieldDropdown
                form={$.form}
                field={field}
                formField={$.formField as FormFields['dropdown']}
                required={!isOptional}
              />
            </Match>
          </Switch>

          <Show when={field.error}>
            <Alert.Root class='mt-2' aria-live='assertive'>
              <p class='text-sm text-red-600'>{field.error}</p>
            </Alert.Root>
          </Show>
        </fieldset>
      )}
    </Field>
  )
}

function FormMedia($: { media: Media[] }) {
  return (
    <div class='flex flex-col space-y-4 z-10'>
      <For each={$.media}>
        {item => (
          <Switch>
            <Match when={item.type === 'image'}>
              <Image.Root fallbackDelay={1000}>
                <Image.Img src={item.href} alt={item.alt} class='rounded overflow-hidden shadow-sm border border-gray-200' />
                <Image.Fallback>Image was not found.</Image.Fallback>
              </Image.Root>
            </Match>
          </Switch>
        )}
      </For>
    </div>
  )
}
