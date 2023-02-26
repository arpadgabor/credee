import { cva, VariantProps } from 'class-variance-authority'
import { JSX, ParentComponent, splitProps } from 'solid-js'
import { focus, formGroup } from './style-utils'

const input = cva(
  [
    'flex items-center rounded border font-normal transition bg-white dark:bg-gray-900 shadow-sm hover:shadow',
    focus,
    formGroup,
  ],
  {
    variants: {
      size: {
        default: 'h-10 px-3',
        sm: 'h-9 px-3',
      },
      theme: {
        default:
          'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600 text-gray-900 dark:text-white focus:border-accent-500',
      },
    },
    defaultVariants: {
      size: 'default',
      theme: 'default',
    },
  }
)

type StyleProps = VariantProps<typeof input>
interface InputProps extends Omit<JSX.InputHTMLAttributes<HTMLInputElement>, 'size'>, StyleProps {}

export const Input: ParentComponent<InputProps> = props => {
  const [local, attrs] = splitProps(props, ['theme', 'size', 'class'])

  return (
    <input
      {...attrs}
      class={input({
        class: local.class,
        theme: local.theme,
        size: local.size,
      })}
    ></input>
  )
}
