# Changelog

All notable changes to this project are documented here.
The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

## [0.2.0] - 2026-11-05

### Added

- `DataGridRoot` + `DataGridView`: split the grid so toolbar controls can live anywhere on the page. `DataGridRoot` owns the state (it takes every `DataGrid` prop); `DataGridView` renders only the table (header, rows, footer, status bar, pagination) and never a toolbar. `GlobalSearch`, `FilterBuilderButton`, `FilterChips`, `ColumnManager`, `DensityMenu`, `ExportMenu`, `SelectionBar` and `useDataGridContext()` work anywhere under the root, including portals and Mantine popovers. `<DataGrid>` is now `DataGridRoot` + the default toolbar + `DataGridView` and behaves as before.
- `FilterChips` shows a removable chip for the active global search text (`includeSearch`, default `true`); "Clear all filters" resets the search and every condition. It renders nothing when nothing is active.
- `statusBar` prop on `DataGrid`, `DataGridRoot` and `DataGridView`: a slim bar below the rows, inside the card (`true`, `{ left, right }` or a render function receiving `{ totalRows, filteredRows, visibleRows, isVirtualized }`). Off by default. New `statusBar` styles name, and `labels.statusScrollHint` / `labels.statusRows`.
- Exported types: `DataGridRootProps`, `DataGridViewProps`, `FilterChipsProps`, `DataGridStatusBar`, `DataGridStatusBarContext`.
- Height-constrained grids always show their scrollbar (`--dg-scrollbar-thumb` / `--dg-scrollbar-track` to restyle).
- Docs: "External toolbar & status bar" page with a File Manager layout over 10,000 virtualized rows.
- Master/detail rows: `renderDetailPanel` renders a full-width panel below an expanded row (with an expand column), `getRowCanExpand` decides which rows expand. Panels are measured for virtualization, and nested grids keep their own keyboard navigation.
- Tree data (`getSubRows`) shows expanders and indentation in the first data column (`treeColumnId` to choose another), toggled with the mouse or `Enter`.
- Grouped column headers are laid out on a CSS grid: group headers are centred over their columns and ungrouped columns span every header row (`aria-rowspan`).
- `meta.footerAggregation: 'roots'` totals top-level rows only (tree data whose parents carry their children's totals); `'leaves'` is the same as `true`.
- `meta.headerStyle`, `meta.footerClassName` and `meta.footerStyle`.
- Copy to clipboard as tab-separated text: `copyToClipboard` / `toClipboardText`, `api.copyToClipboard()` and a "Copy to clipboard" item in the export menu.
- `api.expandAll()` and `api.collapseAll()`; the toolbar shows expand/collapse all for tree data too.
- `Expander` component for custom cells.
- Docs: a "Table recipes" page (resource workload, invoice aging, partner financial summary, status by month).

### Changed

- `useDataGridContext` now re-renders with the grid wherever it is used under a `DataGridRoot`. Memoised rows and cells keep using a non-subscribing internal hook, so row memoization is unchanged.
- Aggregated cells in group rows use `meta.formatAggregate`, then `meta.format`, when the column has no `aggregatedCell`.
- Tree parent rows render their own values with the column's `cell` renderer (not `aggregatedCell`).
- CSV/Excel/clipboard exports of tree data include every level, parents before children (previously only top-level rows).
- Header filter and menu buttons no longer reserve space while hidden, so narrow columns show their full label.

## [0.1.0] - 2026-10-22

### Added

- `DataGrid` component (generic over the row type) built on TanStack Table v8, TanStack Virtual and dnd-kit, styled entirely with Mantine CSS variables.
- Sorting: multi-column, custom sorting functions, controlled/uncontrolled, server-side.
- Filtering: debounced global search, per-column quick filters, visual AND/OR filter builder with nested groups, filter chips, saved presets, custom operators, a serializable `FilterGroup` model, `applyFilterModel` for Node.js.
- Pagination: client/server, page-size selector, row totals.
- Row selection: single/multiple, per-row rules, select page / all filtered, bulk actions.
- Column management: visibility, resizing (mouse and keyboard), reordering, pinning, locking, saved layouts.
- Inline editing: cell and row modes, seven built-in editors, custom editors, sync/async validation, optimistic updates with rollback.
- Grouping and aggregation with aggregate footers and custom group headers.
- Row and column drag and drop (pointer and keyboard).
- Row virtualization with memoized rows.
- CSV export in the core; Excel export (`@kvmb/react-data-grid/export`) loading ExcelJS on demand.
- State persistence, imperative `DataGridApi`, Mantine Styles API support, three densities.
- WAI-ARIA grid/treegrid semantics, keyboard navigation and live announcements.
- Documentation site with live examples, unit/integration/type/e2e/accessibility tests, package verification and benchmarks.
