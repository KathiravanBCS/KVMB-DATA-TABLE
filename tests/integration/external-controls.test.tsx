import { describe, expect, it } from 'vitest';
import { createPortal } from 'react-dom';
import axe from 'axe-core';
import { Popover } from '@mantine/core';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  ColumnManager,
  DataGrid,
  DataGridRoot,
  DataGridView,
  DensityMenu,
  ExportMenu,
  FilterBuilderButton,
  FilterChips,
  GlobalSearch,
  SelectionBar,
  createFilterCondition,
  createFilterGroup,
} from '../../src';
import { columnTexts, employeeColumns, employees, makeRows, renderWithMantine } from '../utils';

const search = () => screen.getByRole('searchbox', { name: 'Search all columns' });

async function violations(container: HTMLElement) {
  const result = await axe.run(container, { rules: { 'color-contrast': { enabled: false }, region: { enabled: false } } });
  return result.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
}

describe('DataGridRoot + DataGridView: controls outside the grid', () => {
  it('renders the view without a toolbar and drives it from controls placed elsewhere', async () => {
    const user = userEvent.setup();
    const { container } = renderWithMantine(
      <DataGridRoot data={employees} columns={employeeColumns} enableFiltering globalFilterDebounce={0} aria-label="Employees">
        <header data-testid="page-header">
          <GlobalSearch />
          <FilterChips />
          <FilterBuilderButton />
        </header>
        <main data-testid="page-body">
          <DataGridView />
        </main>
      </DataGridRoot>,
    );
    // The view has no toolbar; the controls live in the header, not in the grid root.
    expect(container.querySelector('.mdg-toolbar')).toBeNull();
    expect(within(screen.getByTestId('page-header')).getByRole('searchbox')).toBeInTheDocument();
    expect(container.querySelector('.mdg-root')).toBe(within(screen.getByTestId('page-body')).getByRole('grid').closest('.mdg-root'));
    expect(columnTexts(container, 'name')).toEqual(['Alice', 'Bob', 'Carol', 'Dan', 'Eve']);

    await user.type(search(), 'sales');
    expect(columnTexts(container, 'name')).toEqual(['Bob', 'Eve']);
    // The chip is rendered in the header too.
    expect(within(screen.getByTestId('page-header')).getByText('“sales”')).toBeInTheDocument();
  });

  it('shows a removable chip for the search text and clears search and conditions with "Clear all filters"', async () => {
    const user = userEvent.setup();
    const model = { ...createFilterGroup('and'), children: [createFilterCondition('department', 'equals', 'Engineering')] };
    const { container } = renderWithMantine(
      <DataGridRoot data={employees} columns={employeeColumns} enableFiltering globalFilterDebounce={0} defaultFilterModel={model}>
        <GlobalSearch />
        <FilterChips includeSearch />
        <DataGridView />
      </DataGridRoot>,
    );
    expect(columnTexts(container, 'name')).toEqual(['Alice', 'Carol']);
    await user.type(search(), 'carol');
    expect(columnTexts(container, 'name')).toEqual(['Carol']);
    expect(screen.getByRole('button', { name: 'Remove filter: “carol”' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Remove filter: .*Engineering/ })).toBeInTheDocument();

    // Removing the search chip clears the box too.
    await user.click(screen.getByRole('button', { name: 'Remove filter: “carol”' }));
    expect(search()).toHaveValue('');
    expect(columnTexts(container, 'name')).toEqual(['Alice', 'Carol']);

    await user.type(search(), 'alice');
    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(search()).toHaveValue('');
    expect(columnTexts(container, 'name')).toEqual(['Alice', 'Bob', 'Carol', 'Dan', 'Eve']);
    // Nothing active -> renders nothing.
    expect(screen.queryByRole('button', { name: 'Clear all filters' })).toBeNull();
    expect(screen.queryByRole('list', { name: 'Filters' })).toBeNull();
  });

  it('includeSearch={false} hides the search chip and leaves the search alone on "Clear all filters"', async () => {
    const user = userEvent.setup();
    const model = { ...createFilterGroup('and'), children: [createFilterCondition('department', 'equals', 'Sales')] };
    const { container } = renderWithMantine(
      <DataGridRoot data={employees} columns={employeeColumns} enableFiltering globalFilterDebounce={0} defaultFilterModel={model}>
        <GlobalSearch />
        <FilterChips includeSearch={false} />
        <DataGridView />
      </DataGridRoot>,
    );
    await user.type(search(), 'bob');
    expect(screen.queryByRole('button', { name: 'Remove filter: “bob”' })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Clear all filters' }));
    expect(search()).toHaveValue('bob');
    expect(columnTexts(container, 'name')).toEqual(['Bob']);
  });

  it('renders nothing when search-only chips are requested and nothing is active', () => {
    renderWithMantine(
      <DataGridRoot data={employees} columns={employeeColumns} enableFiltering>
        <div data-testid="chips">
          <FilterChips includeSearch />
        </div>
        <DataGridView />
      </DataGridRoot>,
    );
    expect(screen.getByTestId('chips')).toBeEmptyDOMElement();
  });

  it('works through a portal and inside a Mantine Popover, far from the view', async () => {
    const user = userEvent.setup();
    const { container } = renderWithMantine(
      <DataGridRoot data={employees} columns={employeeColumns} enableFiltering globalFilterDebounce={0}>
        {createPortal(
          <div data-testid="portal">
            <GlobalSearch />
            <FilterChips />
          </div>,
          document.body,
        )}
        <Popover opened withinPortal>
          <Popover.Target>
            <button type="button">anchor</button>
          </Popover.Target>
          <Popover.Dropdown>
            <DensityMenu />
            <ExportMenu />
            <ColumnManager />
          </Popover.Dropdown>
        </Popover>
        <DataGridView />
      </DataGridRoot>,
    );
    expect(container.contains(screen.getByTestId('portal'))).toBe(false);
    await user.type(within(screen.getByTestId('portal')).getByRole('searchbox'), 'dan');
    expect(columnTexts(container, 'name')).toEqual(['Dan']);
    expect(within(screen.getByTestId('portal')).getByRole('button', { name: 'Remove filter: “dan”' })).toBeInTheDocument();
    // Popover content reads the same grid.
    expect(screen.getByRole('button', { name: /density/i })).toBeInTheDocument();
  });

  it('SelectionBar placed outside the view follows the selection', async () => {
    const user = userEvent.setup();
    renderWithMantine(
      <DataGridRoot data={employees} columns={employeeColumns} enableRowSelection getRowId={(r) => r.id}>
        <div data-testid="bar">
          <SelectionBar />
        </div>
        <DataGridView />
      </DataGridRoot>,
    );
    expect(within(screen.getByTestId('bar')).queryByText(/selected/i)).toBeNull();
    await user.click(screen.getAllByRole('checkbox', { name: /select row/i })[0]);
    expect(within(screen.getByTestId('bar')).getByText(/1 .*selected/i)).toBeInTheDocument();
  });

  it('throws a helpful error for a control outside any root', () => {
    expect(() => renderWithMantine(<GlobalSearch />)).toThrow(/DataGrid> or <DataGridRoot>/);
  });

  it('has no axe violations in light and dark mode', async () => {
    for (const colorScheme of ['light', 'dark'] as const) {
      const { container, unmount } = renderWithMantine(
        <DataGridRoot
          aria-label="Employees"
          data={employees}
          columns={employeeColumns}
          enableFiltering
          enableRowSelection
          globalFilterDebounce={0}
          defaultFilterModel={{ ...createFilterGroup('and'), children: [createFilterCondition('salary', 'gt', 1)] }}
        >
          <GlobalSearch />
          <FilterChips includeSearch />
          <FilterBuilderButton />
          <DataGridView statusBar />
        </DataGridRoot>,
        { colorScheme },
      );
      expect(await violations(container)).toEqual([]);
      unmount();
    }
  });
});

describe('status bar', () => {
  it('is off by default', () => {
    const { container } = renderWithMantine(<DataGrid data={employees} columns={employeeColumns} />);
    expect(container.querySelector('.mdg-statusbar')).toBeNull();
  });

  it('shows the default texts for `true`: scroll hint only when virtualized, row count on the right', () => {
    const plain = renderWithMantine(<DataGrid data={employees} columns={employeeColumns} statusBar />);
    const bar = plain.container.querySelector<HTMLElement>('.mdg-statusbar')!;
    expect(bar).toHaveTextContent('Showing 5 rows');
    expect(bar).not.toHaveTextContent('Scroll for more rows');
    plain.unmount();

    const virtual = renderWithMantine(
      <DataGrid data={makeRows(1000)} columns={employeeColumns} height={300} enableVirtualization statusBar />,
    );
    const vbar = virtual.container.querySelector<HTMLElement>('.mdg-statusbar')!;
    expect(vbar).toHaveTextContent('Scroll for more rows');
    expect(vbar).toHaveTextContent('Showing 1,000 rows');
  });

  it('sits below the scroll area, never inside it, so virtualization height is unaffected', () => {
    const { container } = renderWithMantine(
      <DataGrid data={makeRows(1000)} columns={employeeColumns} height={300} enableVirtualization statusBar />,
    );
    const scroll = container.querySelector<HTMLElement>('.mdg-scroll')!;
    const bar = container.querySelector<HTMLElement>('.mdg-statusbar')!;
    expect(scroll.contains(bar)).toBe(false);
    expect(bar.previousElementSibling).toBe(scroll);
    expect(scroll.style.height).toBe('300px');
    expect(bar.closest('.mdg-viewport')).toBe(scroll.closest('.mdg-viewport'));
  });

  it('tracks the filtered count', async () => {
    const user = userEvent.setup();
    const { container } = renderWithMantine(
      <DataGridRoot data={employees} columns={employeeColumns} enableFiltering globalFilterDebounce={0}>
        <GlobalSearch />
        <DataGridView statusBar />
      </DataGridRoot>,
    );
    await user.type(search(), 'sales');
    expect(container.querySelector('.mdg-statusbar')).toHaveTextContent('Showing 2 rows');
  });

  it('overrides the texts through labels and through the object form', () => {
    const labels = { statusScrollHint: 'Scroll for more files', statusRows: (n: number) => `Showing ${n} files` };
    const a = renderWithMantine(
      <DataGrid data={makeRows(500)} columns={employeeColumns} height={300} enableVirtualization statusBar labels={labels} />,
    );
    const bar = a.container.querySelector('.mdg-statusbar')!;
    expect(bar).toHaveTextContent('Scroll for more files');
    expect(bar).toHaveTextContent('Showing 500 files');
    a.unmount();

    const b = renderWithMantine(
      <DataGrid data={employees} columns={employeeColumns} statusBar={{ left: 'Left text', right: <b>Right text</b> }} />,
    );
    expect(b.container.querySelector('.mdg-statusbar')).toHaveTextContent('Left text');
    expect(b.container.querySelector('.mdg-statusbar')).toHaveTextContent('Right text');
    b.unmount();

    // `null` hides one side; the other keeps its default.
    const c = renderWithMantine(<DataGrid data={employees} columns={employeeColumns} statusBar={{ left: null }} />);
    expect(c.container.querySelector('.mdg-statusbar')).toHaveTextContent('Showing 5 rows');
  });

  it('renders a function with the row counts', () => {
    const seen: unknown[] = [];
    const { container } = renderWithMantine(
      <DataGrid
        data={makeRows(200)}
        columns={employeeColumns}
        height={300}
        enableVirtualization
        statusBar={(info) => {
          seen.push(info);
          return `${info.filteredRows} of ${info.totalRows} (${info.isVirtualized ? 'virtual' : 'plain'})`;
        }}
      />,
    );
    expect(container.querySelector('.mdg-statusbar')).toHaveTextContent('200 of 200 (virtual)');
    expect(seen[0]).toMatchObject({ totalRows: 200, filteredRows: 200, isVirtualized: true });
  });

  it('DataGridView `statusBar` overrides the grid prop and does not break the a11y tree', async () => {
    const { container } = renderWithMantine(
      <DataGridRoot aria-label="Employees" data={employees} columns={employeeColumns} statusBar={false}>
        <DataGridView statusBar={{ right: 'custom' }} />
      </DataGridRoot>,
    );
    expect(container.querySelector('.mdg-statusbar')).toHaveTextContent('custom');
    expect(screen.getByRole('grid')).toHaveAttribute('aria-rowcount', '6');
    expect(await violations(container)).toEqual([]);
  });
});

describe('DataGrid stays Root + toolbar + View', () => {
  it('still renders the built-in toolbar and the grid', () => {
    const { container } = renderWithMantine(<DataGrid aria-label="Employees" data={employees} columns={employeeColumns} enableFiltering />);
    expect(screen.getByRole('toolbar')).toBeInTheDocument();
    expect(container.querySelectorAll('.mdg-root')).toHaveLength(1);
    expect(columnTexts(container, 'name')).toHaveLength(5);
  });

  it('DataGridView never renders the toolbar even when the grid has toolbar features', () => {
    renderWithMantine(
      <DataGridRoot data={employees} columns={employeeColumns} enableFiltering enableExport>
        <DataGridView />
      </DataGridRoot>,
    );
    expect(screen.queryByRole('toolbar')).toBeNull();
  });
});
