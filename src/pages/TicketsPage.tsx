import { RefreshCw } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TicketsTable } from '@/features/tickets/TicketsTable';
import { useTickets } from '@/hooks/useTickets';
import { getApiErrorMessage } from '@/lib/api-error';
import { TICKET_STATUSES, type Ticket } from '@/types/ticket';

function TicketStats({ tickets }: { tickets: Ticket[] }) {
  const stats = [
    { label: 'Total', value: tickets.length },
    ...TICKET_STATUSES.map((status) => ({
      label: status,
      value: tickets.filter((t) => t.status === status).length,
    })),
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-3xl tabular-nums">{stat.value}</CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export default function TicketsPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useTickets();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tickets</h2>
          <p className="text-sm text-muted-foreground">
            Track QR ticketing flows and active tickets. Refreshes every 30 seconds.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw className={isFetching ? 'animate-spin' : undefined} />
          Refresh
        </Button>
      </div>

      {isPending && (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <span>{getApiErrorMessage(error, 'Could not load tickets.')}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {data && (
        <>
          <TicketStats tickets={data} />
          <TicketsTable data={data} />
        </>
      )}
    </div>
  );
}
