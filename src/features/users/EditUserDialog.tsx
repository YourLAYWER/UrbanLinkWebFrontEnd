import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';

import { FormError } from '@/components/FormError';
import { NativeSelect } from '@/components/NativeSelect';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { editUserSchema, type EditUserValues } from '@/features/users/schemas';
import { useUpdateUser } from '@/hooks/useUsers';
import { getApiErrorMessage } from '@/lib/api-error';
import { ROLE_LABELS, USER_ROLES, type User } from '@/types/user';

function EditUserForm({ user, onClose }: { user: User; onClose: () => void }) {
  const mutation = useUpdateUser();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    defaultValues: {
      name: user.name,
      // Unknown roles fall back to the least-privileged option
      role: user.role === 'Unknown' ? 'StandardUser' : user.role,
    },
  });

  return (
    <form
      onSubmit={handleSubmit((values) =>
        mutation.mutate({ id: user.id, ...values }, { onSuccess: onClose })
      )}
      className="space-y-4"
      noValidate
    >
      {mutation.isError && <FormError message={getApiErrorMessage(mutation.error)} />}

      <div className="space-y-2">
        <Label htmlFor="edit-name">Name</Label>
        <Input id="edit-name" aria-invalid={!!errors.name} {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-role">Role</Label>
        <NativeSelect id="edit-role" {...register('role')}>
          {USER_ROLES.map((role) => (
            <option key={role} value={role}>
              {ROLE_LABELS[role]}
            </option>
          ))}
        </NativeSelect>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending && <LoaderCircle className="animate-spin" />}
          {mutation.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface EditUserDialogProps {
  user: User | null;
  onClose: () => void;
}

export function EditUserDialog({ user, onClose }: EditUserDialogProps) {
  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit user</DialogTitle>
          <DialogDescription>{user?.email}</DialogDescription>
        </DialogHeader>
        {/* key remounts the form with fresh defaults for each user */}
        {user && <EditUserForm key={user.id} user={user} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
