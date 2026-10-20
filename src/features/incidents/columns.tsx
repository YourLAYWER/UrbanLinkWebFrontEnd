import type { ColumnDef } from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import type { Incident, IncidentStatus } from '@/types/incident';

export function getIncidentColumns(
  onStatusChange: (incident: Incident, status: IncidentStatus) => void,
  onOpenNotes: (incident: Incident) => void
): ColumnDef<Incident>[] {
  return [
    { accessorKey: 'reportedByName', header: 'Reported By' },
{ 
      accessorKey: 'category', 
      header: 'Category',
      cell: ({ row }) => {
        const dbCategory = String(row.original.category).toLowerCase().replace(/\s+/g, '');
        
        let displayCategory = String(row.original.category);
        let badgeStyle = "bg-slate-100 text-slate-700"; 
        
        // High Alert (Bright Red): Engine issues
        if (dbCategory.includes('engine') || dbCategory.includes('trouble')) {
          badgeStyle = "bg-red-600 text-white shadow-sm";
          displayCategory = "Engine Trouble";
        } 
        // SWAP 1: Database sent "SOS", but we want it to be "Passenger Dispute" (Bright Green)
        else if (dbCategory === 'sos') {
          displayCategory = "Passenger Dispute";
          badgeStyle = "bg-green-600 text-white shadow-sm";
        } 
        // SWAP 2: Database sent "Passenger Dispute", but we want it to be "SOS" (Bright Orange)
        else if (dbCategory.includes('dispute') || dbCategory.includes('passenger')) {
          displayCategory = "SOS";
          badgeStyle = "bg-orange-500 text-white shadow-sm";
        }

        return (
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${badgeStyle}`}>
            {displayCategory}
          </span>
        );
      }
    },
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
      accessorKey: 'resolvedAt',
      header: 'Resolved Time',
      cell: ({ row }) => {
        const resolvedAt = row.original.resolvedAt;
        const statusStr = String(row.original.status).toLowerCase();
        const isResolved = statusStr === 'resolved' || statusStr === '2';
        
        if (!resolvedAt || !isResolved) {
          return <span className="text-muted-foreground text-xs">-</span>;
        }
        
        // Ensure JavaScript knows this is a UTC timestamp by appending 'Z' if missing
        const utcDateStr = resolvedAt.endsWith('Z') ? resolvedAt : `${resolvedAt}Z`;
        const localDate = new Date(utcDateStr);
        
        return (
          <span className="text-sm font-medium">
            {localDate.toLocaleString(undefined, {
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
        const incident = row.original;
        const statusStr = String(incident.status).toLowerCase();
        
        const isInvestigating = statusStr === 'investigating' || statusStr === '1';
        const isResolved = statusStr === 'resolved' || statusStr === '2';

        return (
          <div className="flex justify-end gap-2">
            
            {/* Shows when Open OR Resolved. Disappears ONLY when already Investigating. */}
            {!isInvestigating && (
              <Button 
                variant="outline" 
                size="sm"
                className="border-blue-300 text-blue-700 hover:bg-blue-50 transition-colors"
                onClick={() => onStatusChange(incident, 'Investigating' as any)}
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
                onClick={() => onStatusChange(incident, 'Resolved' as any)}
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