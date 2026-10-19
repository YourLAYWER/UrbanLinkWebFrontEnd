import { useState, useMemo } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DataTablePagination } from '@/components/DataTablePagination';
import { getIncidentColumns } from '@/features/incidents/columns';
import type { Incident, IncidentStatus } from '@/types/incident';

interface IncidentsTableProps {
  data: Incident[];
  onStatusChange: (incident: Incident, status: IncidentStatus) => void;
  onOpenNotes: (incident: Incident) => void;
}

export function IncidentsTable({ data, onStatusChange, onOpenNotes }: IncidentsTableProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const columns = getIncidentColumns(onStatusChange, onOpenNotes);

  // Filter data based on the selected tab
  const filteredData = useMemo(() => {
    if (activeTab === 'active') {
      return data.filter(inc => {
        const statusStr = String(inc.status).toLowerCase();
        return statusStr !== 'resolved' && statusStr !== '2';
      });
    }
    return data.filter(inc => {
      const statusStr = String(inc.status).toLowerCase();
      return statusStr === 'resolved' || statusStr === '2';
    });
  }, [data, activeTab]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { 
      globalFilter,
      // This dynamically hides the Resolved Time column unless you are on the resolved tab
      columnVisibility: {
        resolvedAt: activeTab === 'resolved',
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: 'includesString',
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 10 } },
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Input
          value={globalFilter}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search incidents..."
          className="sm:max-w-sm"
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger 
              value="active" 
              className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800"
            >
              Active Incidents
            </TabsTrigger>
            <TabsTrigger 
              value="resolved"
              className="data-[state=active]:bg-teal-100 data-[state=active]:text-teal-800"
            >
              Resolved
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  No {activeTab} incidents found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} noun="incident" />
    </div>
  );
}