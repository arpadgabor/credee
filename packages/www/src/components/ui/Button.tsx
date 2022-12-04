import { A } from '@solidjs/router'
import { cva, VariantProps } from 'class-variance-authority'
import { children, JSX, ParentComponent, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'

const button = cva(
  [
    'flex items-center justify-center rounded border font-normal transition',
    'group-[.formrow]:!rounded-none group-[.formrow]:!border-y group-[.formrow]:!border-x-0',
    'group-[.formrow]:first:!rounded-l group-[.formrow]:last:!rounded-r',
    'group-[.formrow]:!border-l group-[.formrow]:last:!border-r',
  ],
  {
    variants: {
      size: {
        lg: 'h-12 px-4 rounded-md group-[.formrow]:first:!rounded-l-md group-[.formrow]:last:!rounded-r-md',
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-sm',
      },
      theme: {
        main: 'bg-amber-400 border-amber-500 hover:bg-amber-500 active:bg-amber-600 text-gray-900',
        accent: 'bg-blue-500 border-blue-600 hover:bg-blue-600 active:bg-blue-700 text-white',
        default: 'bg-white border-gray-200 hover:bg-gray-100 active:bg-gray-200 text-gray-900',
        disabled: 'bg-gray-100 border-gray-200 text-gray-400',
      },
    },
    defaultVariants: {
      size: 'default',
      theme: 'default',
    },
  }
)

type StyleProps = VariantProps<typeof button>
interface ButtonProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement>, StyleProps {}

export const Button: ParentComponent<ButtonProps> = props => {
  const slot = children(() => props.children)
  const [local, attrs] = splitProps(props, ['children', 'theme', 'size', 'class'])

  return (
    <button
      {...attrs}
      class={button({
        class: local.class,
        theme: attrs.disabled ? 'disabled' : local.theme,
        size: local.size,
      })}
    >
      {slot()}
    </button>
  )
}

interface ButtonLinkProps extends JSX.AnchorHTMLAttributes<HTMLAnchorElement>, StyleProps {
  href: string
}

export const ButtonLink: ParentComponent<ButtonLinkProps> = props => {
  const slot = children(() => props.children)
  const [local, attrs] = splitProps(props, ['children', 'theme', 'size', 'class', 'href'])

  return (
    <Dynamic
      component={local.href?.includes('://') ? 'a' : A}
      href={local.href}
      {...attrs}
      class={button({
        class: local.class,
        theme: local.theme,
        size: local.size,
      })}
    >
      {slot()}
    </Dynamic>
  )
}
