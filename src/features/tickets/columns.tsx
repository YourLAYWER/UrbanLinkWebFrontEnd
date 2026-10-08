import type { Column, ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { TicketStatusBadge } from '@/features/tickets/TicketStatusBadge';
import type { Ticket } from '@/types/ticket';

function SortHeader({ column, label }: { column: Column<Ticket, unknown>; label: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown className="size-3.5" />
    </Button>
  );
}

// The QR payload is what gets scanned, so the admin table shows only a short
// preview. Searching still matches the full value.
function maskQr(value: string) {
  return value.length <= 14 ? value : `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export const ticketColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: 'ticketId',
    header: ({ column }) => <SortHeader column={column} label="Ticket" />,
    cell: ({ row }) => <span className="font-medium">#{row.original.ticketId}</span>,
  },
  {
    accessorKey: 'qrCodeData',
    header: 'QR code',
    enableSorting: false,
    cell: ({ row }) => (
      <span className="font-mono text-xs text-muted-foreground">
        {maskQr(row.original.qrCodeData)}
      </span>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => <SortHeader column={column} label="Status" />,
    filterFn: 'equalsString',
    cell: ({ row }) => <TicketStatusBadge status={row.original.status} />,
  },
];
