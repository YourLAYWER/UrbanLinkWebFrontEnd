import { useState } from 'react';
import { RefreshCw, UserPlus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AddStaffDialog } from '@/features/users/AddStaffDialog';
import { DeleteUserDialog } from '@/features/users/DeleteUserDialog';
import { EditUserDialog } from '@/features/users/EditUserDialog';
import { UsersTable } from '@/features/users/UsersTable';
import { useAuth } from '@/hooks/useAuth';
import { useUsers } from '@/hooks/useUsers';
import { getApiErrorMessage } from '@/lib/api-error';
import type { User } from '@/types/user';

function UserStats({ users }: { users: User[] }) {
  const count = (roles: string[]) => users.filter((u) => roles.includes(u.role)).length;
  const stats = [
    { label: 'Total users', value: users.length },
    { label: 'Admins', value: count(['Admin']) },
    { label: 'Staff', value: count(['Conductor', 'Driver']) },
    { label: 'Commuters', value: count(['Student', 'StandardUser']) },
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

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { data, isPending, isError, error, refetch, isFetching } = useUsers();

  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [deleting, setDeleting] = useState<User | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
          <p className="text-sm text-muted-foreground">Manage commuters and staff accounts.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
            <RefreshCw className={isFetching ? 'animate-spin' : undefined} />
            Refresh
          </Button>
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <UserPlus />
            Add staff
          </Button>
        </div>
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
          <span>{getApiErrorMessage(error, 'Could not load users.')}</span>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      )}

      {data && (
        <>
          <UserStats users={data} />
          <UsersTable
            data={data}
            onEdit={setEditing}
            onDelete={setDeleting}
            currentUserId={currentUser?.id}
          />
        </>
      )}

      <AddStaffDialog open={addOpen} onOpenChange={setAddOpen} />
      <EditUserDialog user={editing} onClose={() => setEditing(null)} />
      <DeleteUserDialog user={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}
