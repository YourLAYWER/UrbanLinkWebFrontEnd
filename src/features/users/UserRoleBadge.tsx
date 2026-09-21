import { Badge } from '@/components/ui/badge';
import { ROLE_LABELS, type UserRole } from '@/types/user';

const VARIANTS: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  Admin: 'default',
  Conductor: 'secondary',
  Driver: 'secondary',
  Student: 'outline',
  StandardUser: 'outline',
  Unknown: 'outline',
};

export function UserRoleBadge({ role }: { role: UserRole }) {
  return <Badge variant={VARIANTS[role]}>{ROLE_LABELS[role]}</Badge>;
}
