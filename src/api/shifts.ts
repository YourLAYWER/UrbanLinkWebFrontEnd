import apiClient from './axiosClient';
import type { Shift } from '@/types/shift';

export async function fetchActiveShifts(): Promise<Shift[]> {
  const response = await apiClient.get<Shift[]>('/admin/Shift/active');
  return response.data;
}

export async function forceCloseShift(shiftId: number): Promise<Shift> {
  const response = await apiClient.post<Shift>(`/admin/Shift/${shiftId}/force-close`);
  return response.data;
}
