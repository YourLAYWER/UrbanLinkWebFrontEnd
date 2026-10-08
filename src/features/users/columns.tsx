import type { Column, ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Pencil, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { UserRoleBadge } from '@/features/users/UserRoleBadge';
import type { User } from '@/types/user';

function SortHeader({ column, label }: { column: Column<User, unknown>; label: string }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-3"
      onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
    >
      {label}
      <ArrowUpDown className="size-3.5" />
    </Button>
  );
}

interface ColumnActions {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  currentUserId?: string;
}

export function getUserColumns({ onEdit, onDelete, currentUserId }: ColumnActions): ColumnDef<User>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) => <SortHeader column={column} label="Name" />,
      cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
    },
    {
      accessorKey: 'email',
      header: ({ column }) => <SortHeader column={column} label="Email" />,
    },
    {
      accessorKey: 'role',
      header: ({ column }) => <SortHeader column={column} label="Role" />,
      filterFn: 'equalsString',
      cell: ({ row }) => <UserRoleBadge role={row.original.role} />,
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => <SortHeader column={column} label="Joined" />,
      cell: ({ row }) => (
        <span className="text-muted-foreground">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">Actions</span>,
      enableSorting: false,
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = String(user.id) === currentUserId;
        return (
          <div className="flex justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Edit ${user.name}`}
              onClick={() => onEdit(user)}
            >
              <Pencil />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Delete ${user.name}`}
              title={isSelf ? "You can't delete your own account" : undefined}
              disabled={isSelf}
              onClick={() => onDelete(user)}
            >
              <Trash2 />
            </Button>
          </div>
        );
      },
    },
  ];
}
