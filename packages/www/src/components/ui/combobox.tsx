import { Combobox as _Combobox, createFilter } from '@kobalte/core'
import { For, createMemo, createSignal } from 'solid-js'
import UpDown from '~icons/lucide/chevrons-up-down'
import Check from '~icons/lucide/check'
import { cva, cx, VariantProps } from 'class-variance-authority'
import { focus, formGroup } from './style-utils'

const comboboxOuter = cva(
  [
    'flex items-center rounded border font-normal transition bg-white dark:bg-gray-900 shadow-sm hover:shadow relative',
    focus,
    formGroup,
  ],
  {
    variants: {
      size: { default: 'h-10 px-3' },
      theme: {
        default:
          'border-gray-300 hover:border-gray-400 text-gray-900 dark:text-white dark:border-gray-700 dark:hover:border-gray-600 focus:border-accent-500',
      },
    },
    defaultVariants: {
      size: 'default',
      theme: 'default',
    },
  }
)

type Option = { value: string; label: string }
type StyleProps = VariantProps<typeof comboboxOuter>

interface ComboboxProps<Options extends Option> extends StyleProps {
  class?: string
  name: string
  label: string
  placeholder?: string
  value?: string
  options: Options[]
  onSelect?: (value: Option) => void
}

export function Combobox<T extends Option>(props: ComboboxProps<T>) {
  const filter = createFilter({ sensitivity: 'base' })

  const [options, setOptions] = createSignal<Option[]>(props.options || [])

  function onInput(query: string) {
    if (!query) {
      setOptions(props.options)
    } else {
      setOptions(props.options.filter(option => filter.contains(option.label, query)))
    }
  }

  function onOpen(open: boolean) {
    if (open) {
      setOptions(props.options)
    }
  }

  return (
    <_Combobox.Root<Option>
      name={props.name}
      options={options()}
      onInputChange={onInput}
      onOpenChange={onOpen}
      onChange={v => props.onSelect?.(v)}
      value={props.options.find(option => option.value === props.value)}
      optionValue='value'
      optionTextValue='label'
      optionLabel='label'
      placeholder={props.placeholder}
      itemComponent={option => (
        <_Combobox.Item
          item={option.item}
          class={cx([
            'pr-3 pl-8 py-2 flex justify-between items-center outline-none transition-all relative overflow-hidden',
            'border-l border-r first:border-t last:border-b first:rounded-t last:rounded-b dark:border-gray-700',
            'bg-gradient-to-r from-white dark:from-gray-900 to-white dark:to-gray-900',
            'hover:border-l-accent-500 hover:from-accent-100 dark:hover:from-accent-900 hover:to-white dark:hover:to-gray-900',
            'focus-visible:border-l-accent-500 focus-visible:bg-gradient-to-r focus-visible:from-accent-100 dark:focus-visible:!from-accent-900 focus-visible:to-white dark:focus-visible:!to-gray-900',
            'data-[highlighted=""]:from-accent-100',
          ])}
        >
          <_Combobox.ItemIndicator class='w-6 h-6 ml-1 rounded-full flex items-center justify-center absolute left-0 text-accent-500'>
            <Check class='transform scale-90' />
          </_Combobox.ItemIndicator>

          <_Combobox.ItemLabel class='cursor-default flex-1'>{option.item.textValue}</_Combobox.ItemLabel>
        </_Combobox.Item>
      )}
    >
      <_Combobox.Control class={comboboxOuter({ class: props.class })} aria-label={props.label}>
        <_Combobox.Input class='pr-8 flex-1 text-left focus:outline-none' />

        <_Combobox.Trigger class='absolute right-0 h-full px-3 flex items-center justify-center bg-gradient-to-l from-white dark:from-gray-900 via-white dark:via-gray-900 r-0 rounded'>
          <_Combobox.Icon>
            <UpDown />
          </_Combobox.Icon>
        </_Combobox.Trigger>
      </_Combobox.Control>

      <_Combobox.Portal>
        <_Combobox.Content class='bg-white dark:bg-gray-900 rounded focus-within:outline-none shadow-lg z-[999] max-h-96 overflow-auto'>
          <_Combobox.Listbox class='focus-within:outline-none' />
        </_Combobox.Content>
      </_Combobox.Portal>
    </_Combobox.Root>
  )
}
