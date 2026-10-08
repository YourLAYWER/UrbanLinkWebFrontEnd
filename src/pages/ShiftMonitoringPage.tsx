import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ShiftsTable } from '@/features/shifts/ShiftsTable';
import { useActiveShifts, useForceCloseShift } from '@/hooks/useShifts';
import { getApiErrorMessage } from '@/lib/api-error';

function ShiftStats({ activeCount }: { activeCount: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:max-w-xs">
      <Card>
        <CardHeader>
          <CardDescription>Active shifts</CardDescription>
          <CardTitle className="text-3xl tabular-nums">{activeCount}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

export default function ShiftMonitoringPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useActiveShifts();
  const forceCloseShift = useForceCloseShift();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Shift Monitoring</h2>
          <p className="text-sm text-muted-foreground">
            Live view of currently active driver shifts across the fleet.
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
          <span>{getApiErrorMessage(error, 'Could not load active shifts.')}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {data && (
        <>
          <ShiftStats activeCount={data.length} />
          <ShiftsTable data={data} onForceClose={forceCloseShift.mutate} isClosing={forceCloseShift.isPending} />
        </>
      )}
    </div>
  );
}
