import { A } from '@solidjs/router'
import { cva, VariantProps } from 'class-variance-authority'
import { children, JSX, ParentComponent, splitProps } from 'solid-js'
import { Dynamic } from 'solid-js/web'
import { focus, formGroup } from './style-utils'

const button = cva(
  ['flex items-center justify-center rounded border font-normal transition shadow-sm hover:shadow', focus, formGroup],
  {
    variants: {
      size: {
        default: 'h-10 px-4',
        sm: 'h-8 px-3 text-sm',
      },
      theme: {
        main: 'bg-main-400 border-main-500 hover:bg-main-500 active:bg-main-600 text-gray-900',
        accent: 'bg-accent-500 border-accent-600 hover:bg-accent-600 active:bg-accent-700 text-white',
        default: 'bg-white border-gray-200 hover:bg-gray-100 active:bg-gray-200 text-gray-900',
        ghost: 'bg-white border-transparent hover:bg-gray-50 active:bg-gray-100 text-gray-900 !shadow-none',
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
