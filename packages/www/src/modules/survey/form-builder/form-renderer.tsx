import { Alert, RadioGroup, Image } from '@kobalte/core'
import { createForm, Field, FieldState, Form, FormState, setValue, zodForm } from '@modular-forms/solid'
import { For, Match, ParentComponent, Show, Switch } from 'solid-js'
import { z } from 'zod'
import { Button } from '../../../components/ui'
import { Media, FormData, FormField, FormFields } from './form.type'

interface Props {
  survey: FormData
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
        <For each={props.survey.fields}>{field => <FormFieldMapper formField={field} form={form} />}</For>
      </div>

      <div class='flex justify-end'>
        <Button type='submit' size='lg' theme='accent'>
          Submit!
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
      {f => (
        <fieldset class='flex flex-col p-0'>
          <legend class='font-semibold text-lg text-gray-800 mb-2'>
            <label id={`${f.name}-label`} for={f.name}>
              {$.formField.title}
            </label>
          </legend>

          <Show when={$.formField.description}>
            <p id={`${f.name}-description`} class='text-gray-600'>
              {$.formField.description}
            </p>
          </Show>

          <Show when={$.formField.media}>
            <div class='h-4'></div>
            <FormMedia media={$.formField.media!} />
          </Show>
          <div class='h-4'></div>

          <Switch>
            <Match when={$.formField.type === 'short-text'}>
              {
                <FieldShortText
                  form={$.form}
                  field={f}
                  formField={$.formField as FormFields['short-text']}
                  required={!isOptional}
                />
              }
            </Match>

            <Match when={$.formField.type === 'scale'}>
              {<FieldScale form={$.form} field={f} formField={$.formField as FormFields['scale']} required={!isOptional} />}
            </Match>
          </Switch>

          <Show when={f.error}>
            <Alert.Root class='mt-2' aria-live='assertive'>
              <p class='text-sm text-red-600'>{f.error}</p>
            </Alert.Root>
          </Show>
        </fieldset>
      )}
    </Field>
  )
}

interface SurveyFieldProps<T extends keyof FormFields> {
  form: FormState<any>
  field: FieldState<any, any>
  formField: FormFields[T]
  required: boolean
}
function FieldShortText($: SurveyFieldProps<'short-text'>) {
  return (
    <input
      type='text'
      {...$.field.props}
      id={$.field.name}
      value={$.field.value}
      required={$.required}
      class='h-12 px-3 flex items-center border rounded-md border-gray-300 bg-white shadow-sm hover:shadow transition'
      aria-invalid={!!$.field.error}
      aria-describedby={!!$.formField.description ? `${$.field.name}-description` : undefined}
      aria-labelledby={`${$.field.name}-label`}
    />
  )
}

function FieldScale($: SurveyFieldProps<'scale'>) {
  function onChange(value: string) {
    setValue($.form, $.field.name, Number(value))
  }

  return (
    <RadioGroup.Root name={$.field.name} onValueChange={onChange} class='space-y-2' aria-labelledby={`${$.field.name}-label`}>
      <For each={$.formField.options}>
        {option => (
          <RadioGroup.Item
            value={String(option.value)}
            class='flex focus-within:ring-2 focus-within:ring-blue-500 py-3 px-2 items-center group hover:bg-gray-100 transition rounded-md'
          >
            <RadioGroup.ItemInput />
            <RadioGroup.ItemControl class='relative w-6 h-6 bg-white border border-gray-300 shadow-sm group-hover:shadow rounded-full flex items-center justify-center p-0 m-0 mr-2 transition'>
              <RadioGroup.ItemIndicator class='w-3 h-3 bg-blue-500 rounded-full absolute' />
            </RadioGroup.ItemControl>
            <RadioGroup.ItemLabel class='radio__label'>{option.label}</RadioGroup.ItemLabel>
          </RadioGroup.Item>
        )}
      </For>
    </RadioGroup.Root>
  )
}

function FormMedia($: { media: Media[] }) {
  return (
    <div class='flex flex-col space-y-4'>
      <For each={$.media}>
        {item => (
          <Switch>
            <Match when={item.type === 'image'}>
              <Image.Root fallbackDelay={1000}>
                <Image.Img src={item.href} alt={item.alt} class='rounded overflow-hidden' />
                <Image.Fallback>Image was not found.</Image.Fallback>
              </Image.Root>
            </Match>
          </Switch>
        )}
      </For>
    </div>
  )
}
