import { CellContext } from '@tanstack/solid-table'

export function StringCell<T extends CellContext<any, any>>(cell: T) {
  return <span>{cell.getValue()}</span>
}
