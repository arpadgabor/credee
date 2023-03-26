import { cx } from 'class-variance-authority'

export const formGroup = cx([
  'group-[.formrow]:!rounded-none group-[.formrow]:!border-y group-[.formrow]:!border-x-0',
  'group-[.formrow]:first:!rounded-l group-[.formrow]:last:!rounded-r',
  'group-[.formrow]:!border-l group-[.formrow]:last:!border-r',
])

export const focus = cx(['focus-visible:outline-none focus-visible:ring-2 focus:ring-gray-400'])
