import { useMemo, type ReactNode } from 'react';
import { ActionIcon, Badge, Group, Stack, Title } from '@mantine/core';
import { IconDownload, IconPencil, IconTrash } from '@tabler/icons-react';
import type { ColumnDef } from '@tanstack/react-table';
import { DataGridRoot, DataGridView, FilterBuilderButton, FilterChips, GlobalSearch } from '@kvmb/react-data-grid';

interface FileRow {
  id: string;
  name: string;
  type: string;
  size: number;
  modified: string;
  author: string;
}

const TYPES = ['Document', 'Spreadsheet', 'SQL', 'PDF', 'Image', 'Archive'];
const EXTENSIONS: Record<string, string> = { Document: 'docx', Spreadsheet: 'xlsx', SQL: 'sql', PDF: 'pdf', Image: 'png', Archive: 'zip' };
const AUTHORS = ['kathiravan', 'kathiravan v', 'ada', 'grace', 'linus'];
const WORDS = ['report', 'proposal', 'invoice', 'roadmap', 'budget', 'minutes', 'summary', 'export', 'backup', 'design', 'test', 'notes'];

function generateFiles(count: number): FileRow[] {
  return Array.from({ length: count }, (_, i) => {
    const type = TYPES[i % TYPES.length];
    const day = String((i % 28) + 1).padStart(2, '0');
    const month = String((i % 12) + 1).padStart(2, '0');
    return {
      id: `file-${i + 1}`,
      name: `${WORDS[(i * 7) % WORDS.length]}-${WORDS[(i * 3) % WORDS.length]}-${i + 1}.${EXTENSIONS[type]}`,
      type,
      size: 1 + ((i * 7919) % 9_000_000),
      modified: `2026-${month}-${day}`,
      author: AUTHORS[i % AUTHORS.length],
    };
  });
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(bytes < 10 * 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Row actions are plain cell content owned by the app; the grid only renders them. */
function RowActions({ name }: { name: string }) {
  return (
    <Group gap={6} wrap="nowrap">
      <ActionIcon variant="default" size="sm" aria-label={`Download ${name}`}>
        <IconDownload size={14} />
      </ActionIcon>
      <ActionIcon variant="default" size="sm" aria-label={`Edit ${name}`}>
        <IconPencil size={14} />
      </ActionIcon>
      <ActionIcon variant="default" color="red" size="sm" aria-label={`Delete ${name}`}>
        <IconTrash size={14} />
      </ActionIcon>
    </Group>
  );
}

const columns: ColumnDef<FileRow>[] = [
  { accessorKey: 'name', header: 'Name', size: 280 },
  {
    accessorKey: 'type',
    header: 'Type',
    size: 140,
    meta: { filterVariant: 'select', filterOptions: TYPES.map((t) => ({ value: t, label: t })) },
  },
  {
    accessorKey: 'size',
    header: 'Size',
    size: 110,
    cell: ({ getValue }) => formatSize(getValue<number>()),
    meta: { filterVariant: 'number', align: 'right' },
  },
  { accessorKey: 'modified', header: 'Modified', size: 140, meta: { filterVariant: 'date' } },
  { accessorKey: 'author', header: 'Author', size: 150 },
  {
    id: 'actions',
    header: 'Actions',
    size: 130,
    enableSorting: false,
    enableColumnFilter: false,
    cell: ({ row }) => <RowActions name={row.original.name} />,
  },
];

/** The consuming app's own page layout: not part of the library. */
function PageContainer({ topActions, toolbarEnd, children }: { topActions: ReactNode; toolbarEnd: ReactNode; children: ReactNode }) {
  return (
    <Stack gap="sm">
      <Group justify="space-between" align="center">
        <Title order={2} size="h3">
          File Manager
        </Title>
        <Group gap="xs">
          <Badge variant="default" size="sm">
            OneDrive connected
          </Badge>
          {topActions}
        </Group>
      </Group>
      <Group justify="flex-end" gap="xs" mih={28}>
        {toolbarEnd}
      </Group>
      {children}
    </Stack>
  );
}

export default function ExternalToolbarDemo() {
  const files = useMemo(() => generateFiles(10_000), []);

  return (
    <DataGridRoot
      data={files}
      columns={columns}
      getRowId={(row) => row.id}
      aria-label="Files"
      enableFiltering
      enableRowSelection
      enableColumnResizing
      enableVirtualization
      striped
      withColumnBorders
      height={420}
      labels={{
        statusScrollHint: 'Scroll for more files (Virtualization table)',
        statusRows: (n) => `Showing ${n.toLocaleString()} files`,
      }}
    >
      <PageContainer
        topActions={<GlobalSearch />}
        toolbarEnd={
          <>
            <FilterChips includeSearch />
            <FilterBuilderButton />
          </>
        }
      >
        {/* The table only: no toolbar. The status bar is part of the card, under the rows. */}
        <DataGridView statusBar />
      </PageContainer>
    </DataGridRoot>
  );
}
