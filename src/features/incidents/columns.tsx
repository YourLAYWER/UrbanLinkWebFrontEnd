import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
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
      cell: ({ row }) => {
        const statusStr = String(row.original.status).toLowerCase();
        
        if (statusStr === 'open' || statusStr === '0') {
          return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold tracking-wide">Open</span>; 
        }
        
        if (statusStr === 'investigating' || statusStr === '1') {
          return <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold tracking-wide">Investigating</span>;
        }
        
        if (statusStr === 'resolved' || statusStr === '2') {
          return <span className="px-2.5 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold tracking-wide">Resolved</span>;
        }
        
        return <span>{row.original.status}</span>;
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const incident = row.original;
        
        const statusStr = String(incident.status).toLowerCase();
        const isInvestigating = statusStr === 'investigating' || incident.status === 1;
        const isResolved = statusStr === 'resolved' || incident.status === 2;

        return (
          <div className="flex justify-end gap-2">
            
            {/* Shows when Open OR Resolved. Disappears ONLY when already Investigating. */}
            {!isInvestigating && (
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
                onClick={() => onStatusChange(incident, 1 as any)}
              >
                Investigate
              </Button>
            )}

            {/* Shows when Open OR Investigating. Disappears ONLY when already Resolved. */}
            {!isResolved && (
              <Button 
                variant="outline" 
                size="sm" 
                className="border-green-300 text-green-700 hover:bg-green-50 transition-colors"
                onClick={() => onStatusChange(incident, 2 as any)}
              >
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