import { RadioGroup } from '@kobalte/core'
import { setValue } from '@modular-forms/solid'
import { For } from 'solid-js'
import { Select } from '../../../../components/ui'
import { SurveyFieldProps } from './utils'

export function FieldDropdown($: SurveyFieldProps<'dropdown'>) {
  function onChange(value: string) {
    setValue($.form, $.field.name, value)
  }

  return (
    <Select
      class='w-full'
      name={$.field.name}
      label={$.formField.title}
      options={$.formField.options}
      placeholder={$.formField.placeholder}
    />
  )
}
