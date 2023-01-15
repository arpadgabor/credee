import { Cell, flexRender, Header, HeaderGroup, Row, Table as TableInstance } from '@tanstack/solid-table'
import { cva, VariantProps } from 'class-variance-authority'
import { createMemo, For, Show } from 'solid-js'
import { Button } from '../Button'
import { FormRow } from '../FormRow'
import PhArrowDown from '~icons/ph/arrow-down'
import PhArrowUp from '~icons/ph/arrow-up'

const styles = cva('w-full', {
  variants: {
    size: {
      auto: 'table-auto',
      fixed: 'table-fixed',
    },
  },
})
type TableVariants = VariantProps<typeof styles>

interface DataTableProps<T extends unknown> extends TableVariants {
  table: TableInstance<T>

  loading: boolean
  error: boolean
}

function TableHeaderCell<T>(header: Header<T, unknown>) {
  const style = cva([
    'text-left py-2 px-3 text-sm uppercase border-b bg-gray-100 text-gray-600',
    header.column.getCanSort() ? 'cursor-pointer' : '',
  ])
  return (
    <th
      class={style()}
      style={{ width: `${header.column.getSize()}px` }}
      onClick={header.column.getToggleSortingHandler()}
    >
      <div class='flex'>
        {flexRender(header.column.columnDef.header, header.getContext())}
        <Show when={header.column.getIsSorted() === 'desc'}><PhArrowDown /></Show>
        <Show when={header.column.getIsSorted() === 'asc'}><PhArrowUp /></Show>
      </div>
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

  const table = createMemo(() => props.table)
  const headerGroup = createMemo(() => table().getHeaderGroups())
  const rows = createMemo(() => table().getRowModel().rows)
  const pageCount = createMemo(() => table().getPageCount())

  return (
    <div class='w-full overflow-x-auto relative border border-gray-200 rounded'>
      <table class={styles({ size: props.size })}>
        <thead>
          <For each={headerGroup()}>{TableHeaderGroup}</For>
        </thead>

        <tbody>
          <Show when={props.loading}>
            <tr>
              <td class='py-3 px-3' colSpan='100%'>
                Loading...
              </td>
            </tr>
          </Show>

          <Show when={isSuccess && rows().length === 0}>
            <tr>
              <td class='py-3 px-3' colSpan='100%'>
                No data to show.
              </td>
            </tr>
          </Show>

          <Show when={isSuccess}>
            <For each={rows()}>{TableRow}</For>

            <Show when={rows().length < table().getState().pagination.pageSize}>
              <For each={Array.from({ length: table().getState().pagination.pageSize - rows().length })}>
                {(_, index) => (
                  <tr>
                    <td colSpan={100} class='py-3 px-3'>
                      <span class='opacity-0 invisible'>{index}</span>
                    </td>
                  </tr>
                )}
              </For>
            </Show>
          </Show>
        </tbody>

        <tfoot class='bg-gray-100'>
          <tr>
            <td class='px-3 py-3' colspan='100%'>
              <div class='flex justify-between w-full items-center'>
                <div class='text-sm'>
                  Page {table().getState().pagination.pageIndex + 1} of {pageCount()}
                </div>

                <FormRow>
                  <Button size='sm' theme='default' onClick={table().previousPage} disabled={!table().getCanPreviousPage()}>
                    Previous page
                  </Button>
                  <Button size='sm' theme='default' onClick={table().nextPage} disabled={!table().getCanNextPage()}>
                    Next page
                  </Button>
                </FormRow>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}
