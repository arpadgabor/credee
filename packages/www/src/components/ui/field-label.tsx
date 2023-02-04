import { cx } from 'class-variance-authority'
import { children, ParentComponent } from 'solid-js'

export const FieldLabel: ParentComponent<{ class?: string | string[] }> = props => {
  const slot = children(() => props.children)

  return <p class={cx(['text-sm mb-1', props.class])}>{slot()}</p>
}
