import { setValue } from '@modular-forms/solid'
import { SurveyFieldProps } from './utils'
import { Combobox } from '../../../../components/ui/combobox'

export function FieldSearch($: SurveyFieldProps<'search'>) {
  function onChange(value: { label: string; value: string }) {
    console.log(value)
    setValue($.form, $.field.name, value.value)
  }

  return (
    <Combobox
      class='w-full'
      name={$.field.name}
      label={$.formField.title}
      options={$.formField.options}
      placeholder={$.formField.placeholder}
      // @ts-expect-error kobalte is stupid
      onSelect={onChange}
    />
  )
}
