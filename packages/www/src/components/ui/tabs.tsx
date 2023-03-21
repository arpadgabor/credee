import { Tabs as _Tabs } from '@kobalte/core'
import { cx } from 'class-variance-authority'
import { For, JSXElement } from 'solid-js'

interface Props {
  ariaLabel: string
  tabs: {
    name: string
    header?: JSXElement
    content: JSXElement
  }[]
}

export function Tabs(props: Props) {
  return (
    <_Tabs.Root aria-label={props.ariaLabel}>
      <_Tabs.List class='mb-2'>
        <For each={props.tabs}>
          {tab => (
            <_Tabs.Trigger
              class={cx([
                'px-2 h-8 border border-gray-200',
                'transition shadow-sm',
                'data-[selected]:bg-gray-100 data-[selected]:border-gray-400',
                'first:rounded-l last:rounded-r',
              ])}
              value={tab.name}
            >
              {tab.header || tab.name}
            </_Tabs.Trigger>
          )}
        </For>
      </_Tabs.List>

      <For each={props.tabs}>{tab => <_Tabs.Content value={tab.name}>{tab.content}</_Tabs.Content>}</For>
    </_Tabs.Root>
  )
}
