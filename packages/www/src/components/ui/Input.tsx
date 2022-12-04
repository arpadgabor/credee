import { cva, VariantProps } from 'class-variance-authority'
import { children, JSX, ParentComponent, splitProps } from 'solid-js'

const input = cva(
  [
    'flex items-center rounded border font-normal transition',
    'group-[.formrow]:!rounded-none group-[.formrow]:!border-y group-[.formrow]:!border-x-0',
    'group-[.formrow]:first:!rounded-l group-[.formrow]:last:!rounded-r',
    'group-[.formrow]:!border-l group-[.formrow]:last:!border-r',
  ],
  {
    variants: {
      size: {
        lg: 'h-12 px-4 rounded-md group-[.formrow]:first:!rounded-l-md group-[.formrow]:last:!rounded-r-md',
        default: 'h-10 px-4',
        sm: 'h-8 px-3',
      },
      theme: {
        default: 'bg-white border-gray-200 hover:border-gray-300 active:border-blue-500 text-gray-900',
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
