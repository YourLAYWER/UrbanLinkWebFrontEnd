import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteUser, fetchUsers, registerStaff, updateUser } from '@/api/users';

export const userKeys = {
  all: ['users'] as const,
};

export const useUsers = () =>
  useQuery({
    queryKey: userKeys.all,
    queryFn: fetchUsers,
  });

function useInvalidateUsers() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: userKeys.all });
}

export function useCreateStaff() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: registerStaff, onSuccess: invalidate });
}

export function useUpdateUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: updateUser, onSuccess: invalidate });
}

export function useDeleteUser() {
  const invalidate = useInvalidateUsers();
  return useMutation({ mutationFn: deleteUser, onSuccess: invalidate });
}
