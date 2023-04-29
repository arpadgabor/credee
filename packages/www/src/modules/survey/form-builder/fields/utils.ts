import { FieldStore, FormStore, FieldProps, FieldElementProps } from '@modular-forms/solid'
import { FormFields } from '../form.type'

export interface SurveyFieldProps<T extends keyof FormFields> {
  form: FormStore<any, any>
  field: FieldStore<any, any>
  props: FieldElementProps<any, any>
  formField: FormFields[T]
  required: boolean
}
