import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as api from '@/api/route-studio';
import type { RoutePayload, SchedulePayload } from '@/api/route-studio';

export const routeStudioKeys = {
  providers: ['route-studio', 'providers'] as const,
  summaries: ['route-studio', 'routes'] as const,
  detail: (id: number) => ['route-studio', 'route', id] as const,
  stops: ['route-studio', 'stops'] as const,
};

export const useProviders = () =>
  useQuery({ queryKey: routeStudioKeys.providers, queryFn: api.fetchProviders });

export const useRouteSummaries = () =>
  useQuery({ queryKey: routeStudioKeys.summaries, queryFn: api.fetchRouteSummaries });

export const useStops = () => useQuery({ queryKey: routeStudioKeys.stops, queryFn: api.fetchStops });

export const useRouteDetail = (routeId: number | null) =>
  useQuery({
    queryKey: routeStudioKeys.detail(routeId ?? -1),
    queryFn: () => api.fetchRouteDetail(routeId as number),
    enabled: routeId !== null,
  });

function useInvalidateRoutes(routeId?: number) {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: routeStudioKeys.summaries });
    if (routeId) queryClient.invalidateQueries({ queryKey: routeStudioKeys.detail(routeId) });
  };
}

export function useCreateRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: RoutePayload) => api.createRoute(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: routeStudioKeys.summaries }),
  });
}

export function useUpdateRoute(routeId: number) {
  const invalidate = useInvalidateRoutes(routeId);
  return useMutation({
    mutationFn: (payload: RoutePayload) => api.updateRoute(routeId, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteRoute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => api.deleteRoute(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: routeStudioKeys.summaries }),
  });
}

export function useCreateSchedule(routeId: number) {
  const invalidate = useInvalidateRoutes(routeId);
  return useMutation({
    mutationFn: (payload: SchedulePayload) => api.createSchedule({ ...payload, routeId }),
    onSuccess: invalidate,
  });
}

export function useUpdateSchedule(routeId: number) {
  const invalidate = useInvalidateRoutes(routeId);
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: SchedulePayload }) => api.updateSchedule(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteSchedule(routeId: number) {
  const invalidate = useInvalidateRoutes(routeId);
  return useMutation({
    mutationFn: (id: number) => api.deleteSchedule(id),
    onSuccess: invalidate,
  });
}

export function useReorderStops(routeId: number) {
  const invalidate = useInvalidateRoutes(routeId);
  return useMutation({
    mutationFn: ({ segmentId, orderedStopIds }: { segmentId: number; orderedStopIds: number[] }) =>
      api.reorderStops(segmentId, orderedStopIds),
    onSuccess: invalidate,
  });
}

export function useRemoveStop(routeId: number) {
  const invalidate = useInvalidateRoutes(routeId);
  return useMutation({
    mutationFn: ({ segmentId, stopId }: { segmentId: number; stopId: number }) =>
      api.removeStopFromSegment(segmentId, stopId),
    onSuccess: invalidate,
  });
}

export function useAddStop(routeId: number) {
  const invalidate = useInvalidateRoutes(routeId);
  return useMutation({
    mutationFn: ({ segmentId, stopId }: { segmentId: number; stopId: number }) =>
      api.addStopToSegment(segmentId, stopId),
    onSuccess: invalidate,
  });
}
