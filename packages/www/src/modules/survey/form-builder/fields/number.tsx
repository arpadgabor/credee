import { Input } from '../../../../components/ui'
import { SurveyFieldProps } from './utils'

export function FieldNumber($: SurveyFieldProps<'short-text'>) {
  return (
    <Input
      {...$.props}
      type='number'
      id={$.field.name}
      value={$.field.value}
      required={$.required}
      aria-invalid={!!$.field.error}
      aria-describedby={!!$.formField.description ? `${$.field.name}-description` : undefined}
      aria-labelledby={`${$.field.name}-label`}
    />
  )
}
