import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Shift } from '@/types/shift';

function formatDuration(startTime: string): string {
  const started = new Date(startTime).getTime();
  const minutes = Math.floor((Date.now() - started) / 60000);
  const hours = Math.floor(minutes / 60);
  return hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
}

export function getShiftColumns(onForceClose: (shiftId: number) => void, isClosing: boolean): ColumnDef<Shift>[] {
  return [
    { accessorKey: 'driverName', header: 'Driver' },
    { accessorKey: 'vehicleRegistration', header: 'Vehicle' },
    { accessorKey: 'route', header: 'Route' },
    {
      id: 'duration',
      header: 'Duration',
      cell: ({ row }) => formatDuration(row.original.startTime),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant="default">{row.original.status}</Badge>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <Button
          variant="destructive"
          size="sm"
          disabled={isClosing}
          onClick={() => onForceClose(row.original.shiftID)}
        >
          Force Close
        </Button>
      ),
    },
  ];
}
