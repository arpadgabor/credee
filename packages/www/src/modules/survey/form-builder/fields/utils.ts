import { FieldState, FormState } from '@modular-forms/solid'
import { FormFields } from '../form.type'

export interface SurveyFieldProps<T extends keyof FormFields> {
  form: FormState<any>
  field: FieldState<any, any>
  formField: FormFields[T]
  required: boolean
}
