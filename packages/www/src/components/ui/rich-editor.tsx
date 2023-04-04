import { cx } from 'class-variance-authority'
import { JSXElement, Show, children, createEffect, onMount } from 'solid-js'

import { createEditorTransaction, useEditor } from './rich-editor.utils'
import { type Editor, type JSONContent } from '@tiptap/core'
import Link from '@tiptap/extension-link'
import Typography from '@tiptap/extension-typography'
import StarterKit from '@tiptap/starter-kit'

import Bold from '~icons/ph/text-b'
import Italic from '~icons/ph/text-italic'
import ListOrdered from '~icons/ph/list-numbers'
import ListUnordered from '~icons/ph/list-bullets'
import H1 from '~icons/ph/text-h-one'
import H2 from '~icons/ph/text-h-two'
import H3 from '~icons/ph/text-h-three'
import Unlink from '~icons/ph/link-break'

interface Props {
  readonly?: boolean
  defaultValue?: JSONContent
  onUpdate?: (value: JSONContent) => void
}

export function RichEditor(props: Props) {
  let element!: HTMLDivElement

  const editor = useEditor(() => ({
    element,
    editable: !props.readonly,
    content: props.defaultValue,
    extensions: [
      StarterKit,
      Typography,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          rel: 'noopener noreferrer',
          class: cx('decoration-dotted text-accent-500'),
        },
      }),
    ],
    onUpdate({ editor }) {
      props.onUpdate?.(editor.getJSON())
    },
  }))

  const styles = cx([
    'prose w-full max-w-full outline-none',
    'prose-p:my-2',
    'prose-h1:mb-6 prose-h1:mt-6',
    'prose-h2:mb-4 prose-h2:mt-4',
    'prose-h3:mb-2 prose-h3:mt-3',
    'prose-ul:my-0',
    'prose-ol:my-0',
  ])

  return (
    <div class='w-full'>
      <Show when={editor() && editor()?.isEditable}>
        <Toolbar editor={editor()!} />
      </Show>

      <div class={styles} ref={element} />
    </div>
  )
}

function ToolbarButton(props: {
  editor: Editor
  name: string
  attrs?: any
  onClick: () => void
  children: JSXElement
  title?: string
}) {
  const slot = children(() => props.children)

  const isActive = createEditorTransaction(
    () => props.editor,
    editor => editor.isActive(props.name, props.attrs)
  )

  return (
    <button
      type='button'
      title={props.title}
      onClick={props.onClick}
      class={cx([
        'p-1 rounded transition bg-transparent flex items-center justify-center',
        isActive() ? '!bg-gray-900 text-white hover:bg-gray-700' : 'text-gray-900 hover:bg-gray-200',
      ])}
    >
      {slot()}
    </button>
  )
}

function Toolbar($: { editor: Editor }) {
  const isLinkActive = createEditorTransaction(
    () => $.editor,
    editor => editor.isActive('link')
  )
  const currentLink = createEditorTransaction(
    () => $.editor,
    editor => editor.getAttributes('link')
  )

  return (
    <div class='bg-gray-100 rounded w-full p-1 border border-gray-200 flex space-x-1 items-center'>
      <ToolbarButton editor={$.editor} name='bold' onClick={() => $.editor.chain().focus().toggleBold().run()}>
        <Bold />
      </ToolbarButton>

      <ToolbarButton editor={$.editor} name='italic' onClick={() => $.editor.chain().focus().toggleItalic().run()}>
        <Italic />
      </ToolbarButton>

      <div class='w-2'></div>

      <ToolbarButton editor={$.editor} name='bulletList' onClick={() => $.editor.chain().focus().toggleBulletList().run()}>
        <ListUnordered />
      </ToolbarButton>

      <ToolbarButton editor={$.editor} name='orderedList' onClick={() => $.editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered />
      </ToolbarButton>

      <div class='w-2'></div>

      <ToolbarButton
        editor={$.editor}
        name='heading'
        attrs={{ level: 1 }}
        onClick={() => $.editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <H1 />
      </ToolbarButton>

      <ToolbarButton
        editor={$.editor}
        name='heading'
        attrs={{ level: 2 }}
        onClick={() => $.editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <H2 />
      </ToolbarButton>

      <ToolbarButton
        editor={$.editor}
        name='heading'
        attrs={{ level: 3 }}
        onClick={() => $.editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <H3 />
      </ToolbarButton>

      <div class='w-2'></div>

      <Show when={isLinkActive()}>
        <ToolbarButton
          title={currentLink().href}
          editor={$.editor}
          name='link'
          onClick={() => $.editor.chain().focus().unsetLink().run()}
        >
          <Unlink /> <span class='ml-2 text-xs pr-2 line-clamp-1 flex-1 max-w-[40ch]'>{currentLink().href}</span>
        </ToolbarButton>
      </Show>
    </div>
  )
}
