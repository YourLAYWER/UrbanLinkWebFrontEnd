import { useState, useEffect } from 'react';
import type { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Shift } from '@/types/shift';

// A live-ticking component that updates every minute
function LiveDuration({ startTime, endTime }: { startTime: string, endTime?: string | null }) {
  const [now, setNow] = useState(Date.now());
  
  useEffect(() => {
    if (endTime) return; // Stop ticking if the shift is closed
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, [endTime]);

  const startUtc = startTime.endsWith('Z') ? startTime : `${startTime}Z`;
  const endUtc = endTime ? (endTime.endsWith('Z') ? endTime : `${endTime}Z`) : null;
  
  const start = new Date(startUtc).getTime();
  const end = endUtc ? new Date(endUtc).getTime() : now;
  
  const minutes = Math.floor(Math.max(0, end - start) / 60000);
  const hours = Math.floor(minutes / 60);
  
  return <span className="font-medium">{hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`}</span>;
}

export function getShiftColumns(onForceClose: (shiftId: number) => void, isClosing: boolean): ColumnDef<Shift>[] {
  return [
    { accessorKey: 'driverName', header: 'Driver' },
    { accessorKey: 'vehicleRegistration', header: 'Vehicle' },
    { accessorKey: 'route', header: 'Route' },
    {
      id: 'duration',
      header: 'Duration',
      cell: ({ row }) => <LiveDuration startTime={row.original.startTime} endTime={row.original.endTime} />,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const isClosed = String(row.original.status).toLowerCase() === 'closed';
        return (
          <Badge variant={isClosed ? "secondary" : "default"} className={isClosed ? "" : "bg-blue-600"}>
            {row.original.status}
          </Badge>
        );
      },
    },
   {
      accessorKey: 'endTime',
      header: 'Closed At',
      cell: ({ row }) => {
        const endTime = row.original.endTime;
        if (!endTime) return <span className="text-muted-foreground text-xs">-</span>;
        
        const utcDateStr = endTime.endsWith('Z') ? endTime : `${endTime}Z`;
        return (
          <span className="text-sm font-medium">
            {new Date(utcDateStr).toLocaleString(undefined, {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const isClosed = String(row.original.status).toLowerCase() === 'closed';
        
        if (isClosed) return null; // Hide button if already closed

        return (
          <div className="flex justify-end">
            <Button
              variant="destructive"
              size="sm"
              disabled={isClosing}
              onClick={() => onForceClose(row.original.id)}
            >
              Force Close
            </Button>
          </div>
        );
      },
    },
  ];
}