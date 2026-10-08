import apiClient from './axiosClient';
import type { Incident, UpdateIncidentPayload } from '@/types/incident';

export async function fetchIncidents(): Promise<Incident[]> {
  const response = await apiClient.get<Incident[]>('/admin/Incident');
  return response.data;
}

export async function updateIncident({ id, status, adminNotes }: UpdateIncidentPayload): Promise<Incident> {
  const response = await apiClient.put<Incident>(`/admin/Incident/${id}`, { status, adminNotes });
  return response.data;
}
