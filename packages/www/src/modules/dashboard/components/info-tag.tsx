import { Match, Switch } from 'solid-js'
import ArrowUp from '~icons/lucide/arrow-up'
import ArrowUpDown from '~icons/lucide/arrow-up-down'
import Message from '~icons/lucide/message-square'
import Coin from '~icons/lucide/coins'
import Files from '~icons/lucide/files'

const icons = {
  arrowUp: ArrowUp,
  upDown: ArrowUpDown,
  message: Message,
  coin: Coin,
  files: Files,
} as const

export function InfoTag(props: { value: any; label: string; icon: keyof typeof icons }) {
  return (
    <div class='flex items-center space-x-1' title={props.label}>
      <span>{icons[props.icon]({})}</span>
      <span>{props.value}</span>
    </div>
  )
}
