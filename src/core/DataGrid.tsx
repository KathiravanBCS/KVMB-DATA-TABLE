import type { RowData } from '@tanstack/react-table';
import { DataGridRoot } from './DataGridRoot';
import { DataGridViewInner } from './DataGridView';
import type { DataGridProps } from './grid.types';

export type { DataGridFactory } from './DataGridView';

/**
 * Enterprise data grid built on TanStack Table and Mantine.
 *
 * Generic over the row type: `<DataGrid<Employee> data={rows} columns={columns} />`.
 * Equivalent to `DataGridRoot` + the built-in toolbar + `DataGridView`; use those directly
 * to place the toolbar controls elsewhere on the page.
 */
export function DataGrid<TData extends RowData>(props: DataGridProps<TData>) {
  return (
    <DataGridRoot<TData> {...props}>
      <DataGridViewInner<TData> showToolbar />
    </DataGridRoot>
  );
}

export type { DataGridProps };
