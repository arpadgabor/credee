import { Editor, type EditorOptions } from '@tiptap/core'
import { Accessor, createEffect, createSignal, onCleanup } from 'solid-js'

export function createEditorTransaction<T, V extends Editor | undefined>(instance: () => V, read: (value: V) => T): () => T {
  const [signal, setSignal] = createSignal([])

  function forceUpdate() {
    setSignal([])
  }

  createEffect(() => {
    const editor = instance()
    if (editor) {
      editor.on('transaction', forceUpdate)
      onCleanup(() => {
        editor.off('transaction', forceUpdate)
      })
    }
  })

  return () => {
    signal()
    return read(instance())
  }
}

type BaseEditorOptions = Omit<Partial<EditorOptions>, 'element'>
interface UseEditorOptions<T extends HTMLElement> extends BaseEditorOptions {
  element: T
}

export function useEditor<T extends HTMLElement>(props: () => UseEditorOptions<T>): Accessor<Editor | undefined> {
  const [signal, setSignal] = createSignal<Editor>()

  createEffect(() => {
    const instance = new Editor({
      ...props(),
    })

    onCleanup(() => {
      instance.destroy()
    })

    setSignal(instance)
  })

  return signal
}
