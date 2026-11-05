import type { ReactNode } from 'react';
import { useProps } from '@mantine/core';
import type { RowData } from '@tanstack/react-table';
import { useDataGrid } from './useDataGrid';
import { DataGridProvider, DataGridRenderContext } from './DataGridProvider';
import type { DataGridProps } from './grid.types';

export interface DataGridRootProps<TData extends RowData> extends DataGridProps<TData> {
  children?: ReactNode;
}

/**
 * Owns the grid state and provides it to everything below: `DataGridView` plus any
 * toolbar control (`GlobalSearch`, `FilterChips`, `FilterBuilderButton`, `ColumnManager`,
 * `DensityMenu`, `ExportMenu`, `SelectionBar`, `useDataGridContext`), however far from the view.
 *
 * Takes every `DataGrid` prop. Render exactly one `DataGridView` under it.
 */
export function DataGridRoot<TData extends RowData>({ children, ...inputProps }: DataGridRootProps<TData>) {
  // Theme-level defaults: theme.components.DataGrid.defaultProps
  const props = useProps('DataGrid', {}, inputProps) as DataGridProps<TData>;
  const ctx = useDataGrid<TData>(props);
  // A new token each render: tells context consumers (the view, toolbar controls) that the grid state may have changed.
  return (
    <DataGridProvider value={ctx}>
      <DataGridRenderContext.Provider value={{}}>{children}</DataGridRenderContext.Provider>
    </DataGridProvider>
  );
}
