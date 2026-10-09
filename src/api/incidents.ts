import apiClient from './axiosClient';
import type { Incident, UpdateIncidentPayload } from '@/types/incident';

export async function fetchIncidents(): Promise<Incident[]> {
  // Removed /admin
  const response = await apiClient.get<Incident[]>('/Incident');
  return response.data;
}

export async function updateIncident({ id, status }: UpdateIncidentPayload): Promise<Incident> {
  // Removed /admin
  const response = await apiClient.put<Incident>(`/Incident/${id}`, { status });
  return response.data;
}