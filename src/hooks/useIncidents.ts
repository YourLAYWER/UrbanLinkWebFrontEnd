import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchIncidents, updateIncident } from '@/api/incidents';

export const incidentKeys = {
  all: ['incidents'] as const,
};

export const useIncidents = () =>
  useQuery({
    queryKey: incidentKeys.all,
    queryFn: fetchIncidents,
  });

export function useUpdateIncident() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateIncident,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: incidentKeys.all }),
  });
}
