import { SurveyFieldProps } from './utils'

export function FieldShortText($: SurveyFieldProps<'short-text'>) {
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
