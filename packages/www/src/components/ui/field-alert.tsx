import { Alert } from '@kobalte/core'
import { cva, VariantProps } from 'class-variance-authority'
import { children, ParentComponent } from 'solid-js'

const styles = cva(['font-main pt-2'], {
  variants: {
    type: {
      error: 'text-red-600',
      success: 'text-green-600',
    },
  },
})

export const FieldAlert: ParentComponent<VariantProps<typeof styles> & { class?: string | string[] }> = props => {
  const slot = children(() => props.children)

  return (
    <Alert.Root class={styles({ type: props.type, class: props.class })}>
      <p class='text-xs'>{slot()}</p>
    </Alert.Root>
  )
}
