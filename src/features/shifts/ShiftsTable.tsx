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
import { getShiftColumns } from '@/features/shifts/columns';
import type { Shift } from '@/types/shift';

interface ShiftsTableProps {
  data: Shift[];
  onForceClose: (shiftId: number) => void;
  isClosing: boolean;
}

export function ShiftsTable({ data, onForceClose, isClosing }: ShiftsTableProps) {
  const [globalFilter, setGlobalFilter] = useState('');
  const [activeTab, setActiveTab] = useState('active');
  const columns = getShiftColumns(onForceClose, isClosing);

  const filteredData = useMemo(() => {
    return data.filter(shift => {
      const isClosed = String(shift.status).toLowerCase() === 'closed';
      return activeTab === 'active' ? !isClosed : isClosed;
    });
  }, [data, activeTab]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { 
      globalFilter,
      columnVisibility: {
        endTime: activeTab === 'closed', // Hide Closed At column on Active tab
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
          placeholder="Search by driver, vehicle or route..."
          className="sm:max-w-sm"
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
              Active Shifts
            </TabsTrigger>
            <TabsTrigger value="closed" className="data-[state=active]:bg-slate-200">
              Closed
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
                  No {activeTab} shifts found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <DataTablePagination table={table} noun="shift" />
    </div>
  );
}