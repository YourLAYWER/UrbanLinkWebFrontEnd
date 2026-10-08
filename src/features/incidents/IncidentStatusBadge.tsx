import { Badge } from '@/components/ui/badge';
import type { IncidentStatus } from '@/types/incident';

const statusVariant: Record<IncidentStatus, 'default' | 'secondary' | 'outline'> = {
  Open: 'outline',
  Investigating: 'secondary',
  Resolved: 'default',
};

export function IncidentStatusBadge({ status }: { status: IncidentStatus }) {
  return <Badge variant={statusVariant[status]}>{status}</Badge>;
}
