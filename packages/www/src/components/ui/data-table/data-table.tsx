import { Cell, flexRender, Header, HeaderGroup, Row, Table as TableInstance } from '@tanstack/solid-table'
import { For, Show } from 'solid-js'

interface DataTableProps<T extends unknown> {
  table: TableInstance<T>

  loading: boolean
  error: boolean
}

function TableHeaderCell<T>(header: Header<T, unknown>) {
  return (
    <th
      class='text-left py-2 px-3 text-sm uppercase border-b bg-gray-100 text-gray-600'
      style={{ width: `${header.column.getSize()}px` }}
    >
      {}
      {flexRender(header.column.columnDef.header, header.getContext())}
    </th>
  )
}
function TableHeaderGroup<T>(headerGroup: HeaderGroup<T>) {
  return (
    <tr class=''>
      <For each={headerGroup.headers}>{TableHeaderCell}</For>
    </tr>
  )
}

function TableCell<T>(cell: Cell<T, unknown>) {
  return (
    <td class='py-3 px-3' style={{ width: `${cell.column.getSize()}px` }}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  )
}

function TableRow<T>(row: Row<T>) {
  return (
    <tr>
      <For each={row.getVisibleCells()}>{TableCell}</For>
    </tr>
  )
}

export function DataTable<T extends unknown>(props: DataTableProps<T>) {
  const isSuccess = !(props.loading || props.error)

  const headerGroup = props.table.getHeaderGroups()
  const rows = props.table.getRowModel().rows

  return (
    <div class='w-full overflow-x-auto relative border border-gray-200 rounded'>
      <table class='table-auto w-full'>
        <thead>
          <For each={headerGroup}>{TableHeaderGroup}</For>
        </thead>

        <tbody>
          <Show when={props.loading}>
            <tr>
              <td class='py-3 px-3' colSpan='100%'>
                Loading...
              </td>
            </tr>
          </Show>

          <Show when={isSuccess && rows.length === 0}>
            <tr>
              <td class='py-3 px-3' colSpan='100%'>
                No data to show.
              </td>
            </tr>
          </Show>

          <Show when={isSuccess}>
            <For each={rows}>{TableRow}</For>
          </Show>
        </tbody>
      </table>
    </div>
  )
}
