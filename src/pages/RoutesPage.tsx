import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { StatusPill } from '@/components/StatusPill';
import { RouteMetadataForm } from '@/features/route-studio/RouteMetadataForm';
import { ScheduleManager } from '@/features/route-studio/ScheduleManager';
import { StopSequenceEditor } from '@/features/route-studio/StopSequenceEditor';
import {
  useCreateRoute,
  useDeleteRoute,
  useProviders,
  useRouteDetail,
  useRouteSummaries,
  useStops,
  useUpdateRoute,
} from '@/hooks/useRouteStudio';
import { getApiErrorMessage } from '@/lib/api-error';
import { TRANSIT_TYPES, type TransitTypeName } from '@/types/route-studio';

const fareFormat = new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' });

export default function RoutesPage() {
  const { data: summaries, isPending: summariesLoading } = useRouteSummaries();
  const { data: providers } = useProviders();
  const { data: stops } = useStops();

  const [selectedRouteId, setSelectedRouteId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const { data: route, isPending: routeLoading, isError, error } = useRouteDetail(selectedRouteId);

  const createRoute = useCreateRoute();
  const updateRoute = useUpdateRoute(selectedRouteId ?? -1);
  const deleteRoute = useDeleteRoute();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">Route & Fare Studio</h2>
          <p className="text-sm text-muted-foreground">
            Configure transit lines, waypoint sequencing and schedules.
          </p>
        </div>
        <Button size="sm" onClick={() => setCreateOpen(true)} disabled={!providers?.length}>
          <Plus className="size-4" />
          New route
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="font-display text-base">Routes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            {summariesLoading && <Skeleton className="h-32 w-full" />}
            {summaries?.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRouteId(r.id)}
                className={`w-full rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted ${
                  selectedRouteId === r.id ? 'bg-muted font-medium' : ''
                }`}
              >
                {r.name}
              </button>
            ))}
            {summaries?.length === 0 && (
              <p className="text-sm text-muted-foreground">No routes yet. Create one to get started.</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          {!selectedRouteId && (
            <div className="flex h-64 items-center justify-center rounded-lg border border-dashed text-sm text-muted-foreground">
              Select a route on the left, or create a new one.
            </div>
          )}

          {selectedRouteId && routeLoading && <Skeleton className="h-64 w-full" />}

          {selectedRouteId && isError && (
            <div
              role="alert"
              className="rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {getApiErrorMessage(error, 'Could not load this route.')}
            </div>
          )}

          {route && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="font-display flex items-center gap-2">
                      {route.name}
                      <StatusPill tone="active">
                        {TRANSIT_TYPES[Number(route.transportType)] ?? route.transportType}
                      </StatusPill>
                    </CardTitle>
                    <CardDescription>
                      {route.providerName} · Base fare {fareFormat.format(route.baseFare)}
                    </CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm(`Delete "${route.name}"? This can't be undone.`)) {
                        deleteRoute.mutate(route.id, { onSuccess: () => setSelectedRouteId(null) });
                      }
                    }}
                    aria-label="Delete route"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </CardHeader>
                <CardContent>
                  <RouteMetadataForm
                    providers={providers ?? []}
                    submitLabel="Save changes"
                    isPending={updateRoute.isPending}
                    error={updateRoute.error}
                    defaultValues={{
                      name: route.name,
                      transportType: (TRANSIT_TYPES[Number(route.transportType)] ?? 'Bus') as TransitTypeName,
                      baseFare: route.baseFare,
                      providerId: route.providerId,
                    }}
                    onSubmit={(values) =>
                      updateRoute.mutate({
                        routeName: values.name,
                        transportType: TRANSIT_TYPES.indexOf(values.transportType),
                        baseFare: values.baseFare,
                        providerId: values.providerId,
                      })
                    }
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-base">Waypoint sequencing</CardTitle>
                  <CardDescription>
                    {route.segments.length === 0
                      ? "This route has no segments yet. Creating new segments isn't part of this screen yet."
                      : 'Reorder or remove stops on each segment.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {route.segments.map((segment) => (
                    <StopSequenceEditor key={segment.id} routeId={route.id} segment={segment} allStops={stops ?? []} />
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-display text-base">Schedules</CardTitle>
                </CardHeader>
                <CardContent>
                  <ScheduleManager routeId={route.id} schedules={route.schedules} />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display">New route</DialogTitle>
          </DialogHeader>
          <RouteMetadataForm
            providers={providers ?? []}
            submitLabel="Create route"
            isPending={createRoute.isPending}
            error={createRoute.error}
            onSubmit={(values) =>
              createRoute.mutate(
                {
                  routeName: values.name,
                  transportType: TRANSIT_TYPES.indexOf(values.transportType),
                  baseFare: values.baseFare,
                  providerId: values.providerId,
                },
                {
                  onSuccess: (data) => {
                    setCreateOpen(false);
                    setSelectedRouteId(data.id);
                  },
                }
              )
            }
            onCancel={() => setCreateOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
