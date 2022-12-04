import { CellContext } from '@tanstack/solid-table'

const dateFormat = new Intl.DateTimeFormat('en-GB', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function StringCell<T extends CellContext<any, any>>(cell: T) {
  return <span>{cell.getValue()}</span>
}

export function DateCell<T extends CellContext<any, any>>(cell: T) {
  return <span>{cell.getValue() && dateFormat.format(new Date(cell.getValue()))}</span>
}
