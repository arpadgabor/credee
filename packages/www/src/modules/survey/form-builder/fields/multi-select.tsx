import { RadioGroup } from '@kobalte/core'
import { setValue } from '@modular-forms/solid'
import { For } from 'solid-js'
import { SurveyFieldProps } from './utils'

export function FieldMultiSelect($: SurveyFieldProps<'multi-select'>) {
  function onChange(value: string) {
    setValue($.form, $.field.name, value)
  }

  return (
    <RadioGroup.Root name={$.field.name} onValueChange={onChange} class='space-y-2' aria-labelledby={`${$.field.name}-label`}>
      <For each={$.formField.options}>
        {option => (
          <RadioGroup.Item
            value={String(option.value)}
            class='flex focus-within:ring-2 focus-within:ring-accent-500 py-3 px-2 items-center group hover:bg-gray-100 dark:hover:bg-gray-800 transition rounded-md transform active:scale-[0.99]'
          >
            <RadioGroup.ItemInput />
            <RadioGroup.ItemControl class='relative w-6 h-6 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 shadow-sm group-hover:shadow rounded-full flex items-center justify-center p-0 m-0 mr-2 transition'>
              <RadioGroup.ItemIndicator class='w-3 h-3 bg-accent-500 rounded-full absolute' />
            </RadioGroup.ItemControl>
            <RadioGroup.ItemLabel class='radio__label'>{option.label}</RadioGroup.ItemLabel>
          </RadioGroup.Item>
        )}
      </For>
    </RadioGroup.Root>
  )
}
