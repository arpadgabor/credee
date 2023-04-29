import { Input } from '../../../../components/ui'
import { SurveyFieldProps } from './utils'

export function FieldShortText($: SurveyFieldProps<'short-text'>) {
  return (
    <Input
      type='text'
      {...$.props}
      id={$.field.name}
      value={$.field.value}
      required={$.required}
      aria-invalid={!!$.field.error}
      aria-describedby={!!$.formField.description ? `${$.field.name}-description` : undefined}
      aria-labelledby={`${$.field.name}-label`}
    />
  )
}
