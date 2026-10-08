import { LoaderCircle } from 'lucide-react';

import { FormError } from '@/components/FormError';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useDeleteUser } from '@/hooks/useUsers';
import { getApiErrorMessage } from '@/lib/api-error';
import type { User } from '@/types/user';

interface DeleteUserDialogProps {
  user: User | null;
  onClose: () => void;
}

export function DeleteUserDialog({ user, onClose }: DeleteUserDialogProps) {
  const mutation = useDeleteUser();

  const close = () => {
    mutation.reset();
    onClose();
  };

  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete user?</DialogTitle>
          <DialogDescription>
            This permanently deletes <strong>{user?.name}</strong> ({user?.email}). This can&apos;t be
            undone.
          </DialogDescription>
        </DialogHeader>

        {mutation.isError && <FormError message={getApiErrorMessage(mutation.error)} />}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={mutation.isPending}
            onClick={() => user && mutation.mutate(user.id, { onSuccess: close })}
          >
            {mutation.isPending && <LoaderCircle className="animate-spin" />}
            {mutation.isPending ? 'Deleting...' : 'Delete user'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
