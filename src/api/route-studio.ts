import apiClient from '@/api/axiosClient';
import type { Provider, RouteDetail, RouteSummary, Stop } from '@/types/route-studio';

export const fetchProviders = async (): Promise<Provider[]> => {
  const { data } = await apiClient.get<Provider[]>('/TransitProvider/summary');
  return data;
};

export const fetchRouteSummaries = async (): Promise<RouteSummary[]> => {
  const { data } = await apiClient.get<{ data: RouteSummary[] }>('/TransitRoute/routes');
  return data.data;
};

export const fetchRouteDetail = async (routeId: number): Promise<RouteDetail> => {
  const { data } = await apiClient.get<RouteDetail>(`/TransitRoute/${routeId}`);
  return data;
};

export const fetchStops = async (): Promise<Stop[]> => {
  const { data } = await apiClient.get<Stop[]>('/Stops');
  return data;
};

export interface RoutePayload {
  routeName: string;
  transportType: number; // enum index, see TRANSIT_TYPES
  baseFare: number;
  providerId: number;
}

export const createRoute = async (payload: RoutePayload) => {
  const { data } = await apiClient.post<{ id: number }>('/TransitRoute', payload);
  return data;
};

export const updateRoute = async (id: number, payload: RoutePayload) => {
  await apiClient.put(`/TransitRoute/${id}`, payload);
};

export const deleteRoute = async (id: number) => {
  await apiClient.delete(`/TransitRoute/${id}`);
};

export interface SchedulePayload {
  routeId?: number; // only needed on create
  daysOfOperation: string;
  firstDepartureTime: string; // "HH:mm"
  lastDepartureTime: string; // "HH:mm"
  frequencyMinutes: number;
}

export const createSchedule = async (payload: SchedulePayload) => {
  await apiClient.post('/RouteSchedules', payload);
};

export const updateSchedule = async (id: number, payload: SchedulePayload) => {
  await apiClient.put(`/RouteSchedules/${id}`, payload);
};

export const deleteSchedule = async (id: number) => {
  await apiClient.delete(`/RouteSchedules/${id}`);
};

export const reorderStops = async (segmentId: number, orderedStopIds: number[]) => {
  await apiClient.put(`/RouteStops/segment/${segmentId}/reorder`, { orderedStopIds });
};

export const removeStopFromSegment = async (segmentId: number, stopId: number) => {
  await apiClient.delete(`/RouteStops/${segmentId}/${stopId}`);
};

export const addStopToSegment = async (segmentId: number, stopId: number) => {
  await apiClient.post('/RouteStops', { segmentId, stopId });
};
