import { Dialog } from '@kobalte/core'
import { children, JSX, ParentComponent, Show } from 'solid-js'
import IconClose from '~icons/lucide/x'

interface Props {
  title: JSX.Element
  trigger: JSX.Element
  description?: JSX.Element
  isOpen?: boolean
  onOpen?: (isOpen: boolean) => void
}

export const Panel: ParentComponent<Props> = props => {
  const slot = children(() => props.children)

  return (
    <Dialog.Root isModal={true} isOpen={props.isOpen} onOpenChange={props.onOpen}>
      <Dialog.Trigger as='div'>{props.trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay class='w-screen h-screen absolute top-0 left-0 bg-gray-900/50 backdrop-blur-sm transition-all flex items-center justify-end z-40' />

        <div class='absolute inset-0 flex justify-end z-50'>
          <Dialog.Content
            as='section'
            class='flex flex-col h-screen bg-white p-4 md:p-8 max-w-3xl w-full shadow-lg overflow-auto'
          >
            <header class=''>
              <div class='flex justify-between items-center w-full'>
                <Dialog.Title as='h1' class='text-xl font-bold'>
                  {props.title}
                </Dialog.Title>

                <Dialog.CloseButton as='button'>
                  <IconClose />
                </Dialog.CloseButton>
              </div>

              <Show when={props.description}>
                <Dialog.Description class='mt-4 text-gray-600'>{props.description}</Dialog.Description>
              </Show>
              <hr class='my-8' />
            </header>

            <main class='flex flex-1 flex-col'>{slot()}</main>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
