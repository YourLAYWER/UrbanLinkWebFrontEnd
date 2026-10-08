import apiClient from '@/api/axiosClient';
import type { LoginRequest, LoginResponse } from '@/types/auth';

export const loginRequest = async (credentials: LoginRequest): Promise<LoginResponse> => {
  const { data } = await apiClient.post<LoginResponse>('/Auth/login', credentials);
  return data;
};
