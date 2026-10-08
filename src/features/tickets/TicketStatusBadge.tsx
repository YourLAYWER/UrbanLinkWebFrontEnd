import { Badge } from '@/components/ui/badge';
import type { TicketStatus } from '@/types/ticket';

const VARIANTS: Record<TicketStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Active: 'default',
  Used: 'secondary',
  Expired: 'destructive',
  Unknown: 'outline',
};

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={VARIANTS[status]}>{status}</Badge>;
}
