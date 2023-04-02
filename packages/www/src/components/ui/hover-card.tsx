import { children, createSignal, JSX, ParentComponent } from 'solid-js'
import { HoverCard as _ } from '@kobalte/core'
import { Transition } from 'solid-transition-group'
interface HoverCardProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  content: JSX.Element
  openDelay?: number
  closeDelay?: number
}

export const HoverCard: ParentComponent<HoverCardProps> = props => {
  const slot = children(() => props.children)
  const [isOpen, setIsOpen] = createSignal(false)
  return (
    <_.Root openDelay={props.openDelay} closeDelay={props.closeDelay} isOpen={isOpen()} onOpenChange={v => setIsOpen(v)}>
      <_.Trigger>{slot()}</_.Trigger>
      <Transition enterActiveClass='transition' exitActiveClass='transition' enterClass='opacity-0' enterToClass='opacity-100'>
        <_.Portal>
          <_.Content
            onClick={() => setIsOpen(false)}
            class='bg-white p-4 border border-gray-100 shadow-md rounded-md animate-[fade-out_100ms_ease-in] data-[expanded]:animate-[fade-up_100ms_ease-out]'
          >
            <_.Arrow />
            <div>{props.content}</div>
          </_.Content>
        </_.Portal>
      </Transition>
    </_.Root>
  )
}
