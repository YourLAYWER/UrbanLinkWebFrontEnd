import apiClient from './axiosClient';

export interface BroadcastPayload {
  message: string;
  routeSegmentID?: number;
}

export async function sendBroadcast(payload: BroadcastPayload) {
  const response = await apiClient.post('/admin/Broadcast', payload);
  return response.data;
}
