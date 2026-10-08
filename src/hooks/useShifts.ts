import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchActiveShifts, forceCloseShift } from '@/api/shifts';

export const shiftKeys = {
  all: ['shifts', 'active'] as const,
};

export const useActiveShifts = () =>
  useQuery({
    queryKey: shiftKeys.all,
    queryFn: fetchActiveShifts,
    refetchInterval: 15000, // live-feeling dashboard: refresh every 15s
  });

export function useForceCloseShift() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: forceCloseShift,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: shiftKeys.all }),
  });
}
