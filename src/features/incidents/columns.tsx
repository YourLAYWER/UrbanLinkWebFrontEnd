import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { IncidentStatusBadge } from '@/features/incidents/IncidentStatusBadge';
import type { Incident, IncidentStatus } from '@/types/incident';

export function getIncidentColumns(
  onStatusChange: (incident: Incident, status: IncidentStatus) => void,
  onOpenNotes: (incident: Incident) => void
): ColumnDef<Incident>[] {
  return [
    { accessorKey: 'reportedByName', header: 'Reported By' },
    { accessorKey: 'type', header: 'Type' },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => <span className="line-clamp-2 max-w-xs">{row.original.description}</span>,
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <IncidentStatusBadge status={row.original.status} />,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const incident = row.original;
        return (
          <div className="flex justify-end gap-2">
            {incident.status === 'Open' && (
              <Button variant="outline" size="sm" onClick={() => onStatusChange(incident, 'Investigating')}>
                Investigate
              </Button>
            )}
            {incident.status !== 'Resolved' && (
              <Button variant="outline" size="sm" onClick={() => onStatusChange(incident, 'Resolved')}>
                Resolve
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={() => onOpenNotes(incident)}>
              Notes
            </Button>
          </div>
        );
      },
    },
  ];
}
