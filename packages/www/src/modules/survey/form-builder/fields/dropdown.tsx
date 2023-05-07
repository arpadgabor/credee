import { setValue } from '@modular-forms/solid'
import { Select } from '../../../../components/ui'
import { SurveyFieldProps } from './utils'

export function FieldDropdown($: SurveyFieldProps<'dropdown'>) {
  function onChange(value: { label: string; value: string }) {
    setValue($.form, $.field.name, value.value)
  }

  return (
    <Select
      class='w-full'
      name={$.field.name}
      label={$.formField.title}
      options={$.formField.options}
      placeholder={$.formField.placeholder}
      onSelect={onChange}
    />
  )
}
