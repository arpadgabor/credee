import { cva, VariantProps } from 'class-variance-authority'
import { children, ParentComponent, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

const row = cva('flex group formrow')

type StyleProps = VariantProps<typeof row>
interface InputProps extends StyleProps {
  as?: string
  class?: string
}

export const FormRow: ParentComponent<InputProps> = props => {
  const slot = children(() => props.children)
  const [local, attrs] = splitProps(props, ['children', 'as', 'class'])

  return (
    <Dynamic
      component={local.as ?? 'div'}
      {...attrs}
      class={row({
        class: local.class,
      })}
    >
      {slot()}
    </Dynamic>
  )
}
