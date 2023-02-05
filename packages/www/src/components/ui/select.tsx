import { Select as _Select } from '@kobalte/core'
import { For, JSX, Show } from 'solid-js'
import UpDown from '~icons/lucide/chevrons-up-down'
import Check from '~icons/lucide/check'
import { cva, cx, VariantProps } from 'class-variance-authority'
import { focus, formGroup } from './style-utils'

const selectOuter = cva(
  ['flex items-center rounded border font-normal transition bg-white shadow-sm hover:shadow relative', focus, formGroup],
  {
    variants: {
      size: { default: 'h-10 px-3' },
      theme: {
        default: 'border-gray-300 hover:border-gray-400 text-gray-900 focus:border-accent-500',
      },
    },
    defaultVariants: {
      size: 'default',
      theme: 'default',
    },
  }
)

type Option = { value: string; label: string }
type StyleProps = VariantProps<typeof selectOuter>
interface InputProps<Options extends Option> extends StyleProps {
  class?: string
  name: string
  label: string
  placeholder?: string
  value?: string
  options: Options[]
  onSelect?: (value: string) => void
}

export function Select<T extends Option>($: InputProps<T>) {
  return (
    <_Select.Root name={$.name} onValueChange={$.onSelect} value={$.value}>
      <_Select.Trigger class={selectOuter({ class: $.class })} aria-label={$.label}>
        <_Select.Value placeholder={$.placeholder} class='pr-8 flex-1 text-left' />

        <_Select.Icon
          class={'absolute right-0 h-full px-3 flex items-center justify-center bg-gradient-to-l from-white via-white r-0'}
        >
          <UpDown />
        </_Select.Icon>
      </_Select.Trigger>

      <_Select.Portal>
        <_Select.Content class='bg-white rounded focus-within:outline-none shadow-lg z-[999]'>
          <_Select.Listbox class='focus-within:outline-none'>
            <For each={$.options || []}>
              {option => (
                <_Select.Item
                  value={option.value}
                  class={cx([
                    'pr-3 pl-8 py-2 flex justify-between items-center outline-none transition-all relative overflow-hidden',
                    'border-l border-r first:border-t last:border-b first:rounded-t last:rounded-b',
                    'bg-gradient-to-r from-white to-white',
                    'hover:border-l-accent-500 hover:bg-gradient-to-r hover:from-accent-100 hover:to-white',
                    'focus-visible:border-l-accent-500 focus-visible:bg-gradient-to-r focus-visible:from-accent-100 focus-visible:to-white',
                  ])}
                >
                  <_Select.ItemIndicator class='w-6 h-6 ml-1 rounded-full flex items-center justify-center absolute left-0 text-accent-500'>
                    <Check class='transform scale-90' />
                  </_Select.ItemIndicator>

                  <_Select.ItemLabel class='cursor-default flex-1'>{option.label}</_Select.ItemLabel>
                </_Select.Item>
              )}
            </For>
          </_Select.Listbox>
        </_Select.Content>
      </_Select.Portal>
    </_Select.Root>
  )
}
