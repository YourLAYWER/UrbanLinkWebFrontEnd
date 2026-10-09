import apiClient from './axiosClient';

export interface BroadcastPayload {
  message: string;

}

export interface BroadcastHistoryItem {
  id: number;
  message: string;
  recipientCount: number;
}

export async function sendBroadcast(payload: BroadcastPayload) {
  const response = await apiClient.post('/admin/Broadcast', payload);
  return response.data;
}

export async function fetchBroadcastHistory(): Promise<BroadcastHistoryItem[]> {
  const response = await apiClient.get<BroadcastHistoryItem[]>('/admin/Broadcast/history');
  return response.data;
}