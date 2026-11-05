import { createContext, useContext } from 'react';
import type { RowData } from '@tanstack/react-table';
import type { DataGridContextValue } from './useDataGrid';

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- context is shared across all row types; consumers narrow it with useDataGridContext<TData>()
export const DataGridContext = createContext<DataGridContextValue<any> | null>(null);

export const DataGridProvider = DataGridContext.Provider;

/**
 * The grid context object is stable (it is refreshed in place), so React cannot tell when the grid state changed.
 * `DataGridRoot` provides a fresh token on every render; components that read the grid through
 * `useDataGridContext` subscribe to it and re-render with the grid, wherever they sit under the root.
 */
export const DataGridRenderContext = createContext<object | null>(null);

/**
 * Access the grid from custom cells, headers, toolbars or bulk actions
 * rendered inside a `DataGrid` or anywhere under a `DataGridRoot`.
 * Re-renders whenever the grid re-renders (sorting, filtering, selection, ...).
 */
export function useDataGridContext<TData extends RowData = unknown>(): DataGridContextValue<TData> {
  useContext(DataGridRenderContext); // subscribe: see DataGridRenderContext
  return useStableDataGridContext<TData>();
}

/**
 * @internal Same context without subscribing to every grid render. For memoised rows and cells, which receive
 * the values that affect them as props and must not re-render on unrelated grid updates.
 */
export function useStableDataGridContext<TData extends RowData = unknown>(): DataGridContextValue<TData> {
  const ctx = useContext(DataGridContext);
  if (!ctx) throw new Error('useDataGridContext must be used inside <DataGrid> or <DataGridRoot>.');
  return ctx as DataGridContextValue<TData>;
}
