import { children, For, JSX, Match, ParentComponent, splitProps, Switch } from 'solid-js'
import { ContextMenu as CtxMenu } from '@kobalte/core'

interface Option {
  icon?: JSX.Element
  content: JSX.Element
}
interface OptionWithCommand extends Option {
  command: () => void
}
interface OptionWithChildren extends Option {
  children: ContextOptions[]
}
export type ContextOptions = OptionWithCommand | OptionWithChildren

interface Props {
  options: ContextOptions[]
}

export const ContextMenu: ParentComponent<Props> = props => {
  const slot = children(() => props.children)

  return (
    <CtxMenu.Root>
      <CtxMenu.Trigger>{slot()}</CtxMenu.Trigger>

      <CtxMenu.Portal>
        <CtxMenu.Content class='bg-white dark:bg-gray-900 rounded shadow-lg p-1 border border-gray-100 dark:border-gray-800'>
          <ContextItems options={props.options} />
        </CtxMenu.Content>
      </CtxMenu.Portal>
    </CtxMenu.Root>
  )
}

const ContextItem = (props: { option: ContextOptions }) => {
  return (
    <CtxMenu.Item
      class='h-9 px-3 w-64 rounded flex items-center cursor-default hover:bg-gray-100 dark:hover:bg-gray-800 transition duration-150'
      onSelect={(props.option as OptionWithCommand).command}
    >
      <div class='w-8 flex items-center text-gray-700 dark:text-gray-500'>{props.option.icon ? props.option.icon : null}</div>
      {props.option.content}
    </CtxMenu.Item>
  )
}

function ContextItems(props: { options: ContextOptions[] }) {
  return (
    <For each={props.options}>
      {option => (
        <Switch>
          <Match when={'command' in option}>
            <ContextItem option={option} />
          </Match>
          <Match when={'children' in option}>
            <CtxMenu.Sub overlap gutter={4} shift={-4}>
              <CtxMenu.SubTrigger class='context-menu__sub-trigger'>
                <ContextItem option={option} />
              </CtxMenu.SubTrigger>
              <CtxMenu.Portal>
                <CtxMenu.SubContent class='bg-white dark:bg-gray-900 rounded shadow-lg p-1 border border-gray-100 dark:border-gray-800'>
                  <ContextItems options={(option as OptionWithChildren).children} />
                </CtxMenu.SubContent>
              </CtxMenu.Portal>
            </CtxMenu.Sub>
          </Match>
        </Switch>
      )}
    </For>
  )
}
