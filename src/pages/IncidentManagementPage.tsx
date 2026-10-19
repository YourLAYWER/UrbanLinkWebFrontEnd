import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { IncidentsTable } from '@/features/incidents/IncidentsTable';
import { IncidentNotesDialog } from '@/features/incidents/IncidentNotesDialog';
import { useIncidents, useUpdateIncident } from '@/hooks/useIncidents';
import { getApiErrorMessage } from '@/lib/api-error';
import type { Incident, IncidentStatus } from '@/types/incident';

export default function IncidentManagementPage() {
  const { data, isPending, isError, error, refetch, isFetching } = useIncidents();
  const updateIncident = useUpdateIncident();
  const [notesTarget, setNotesTarget] = useState<Incident | null>(null);

  const handleStatusChange = (incident: Incident, status: IncidentStatus) => {
    // FIX: Grab the correct 'id' from the C# backend. 
    // Fallback to incidentID just in case your frontend types require it.
    const correctId = (incident as any).id || incident.incidentID;

    updateIncident.mutate(
      { 
        id: correctId, 
        status: status, 
        adminNotes: incident.adminNotes ?? undefined 
      },
      {
        // Automatically refresh the table data as soon as the C# backend confirms success!
        // This will instantly slide the incident over to the Resolved tab with its timestamp.
        onSuccess: () => {
          refetch();
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Incident Management</h2>
          <p className="text-sm text-muted-foreground">
            Review driver and commuter-reported incidents, update status, and add admin notes.
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
          <span>{getApiErrorMessage(error, 'Could not load incidents.')}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {data && (
        <IncidentsTable data={data} onStatusChange={handleStatusChange} onOpenNotes={setNotesTarget} />
      )}

      <IncidentNotesDialog incident={notesTarget} onClose={() => setNotesTarget(null)} />
    </div>
  );
}