import { children, JSX, ParentComponent, splitProps } from 'solid-js'
import { HoverCard as HC } from '@kobalte/core'

interface HoverCardProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  content: JSX.Element
}

export const HoverCard: ParentComponent<HoverCardProps> = props => {
  const slot = children(() => props.children)

  return (
    <HC.Root>
      <HC.Trigger>{slot()}</HC.Trigger>
      <HC.Portal>
        <HC.Content class='bg-white p-4 border border-gray-100 shadow-md rounded-md'>
          <HC.Arrow />
          <div>{props.content}</div>
        </HC.Content>
      </HC.Portal>
    </HC.Root>
  )
}
