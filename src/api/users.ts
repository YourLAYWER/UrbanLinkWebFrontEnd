import apiClient from '@/api/axiosClient';
import { USER_ROLES, type KnownUserRole, type User, type UserRole } from '@/types/user';

// What UserController.GetUsers returns. Without a JsonStringEnumConverter the
// role arrives as a number, so we accept a number or a string.
interface UserApiModel {
  id: number;
  name: string;
  email: string;
  role: number | string;
  createdAt: string;
}

function normalizeRole(raw: number | string): UserRole {
  if (typeof raw === 'number') return USER_ROLES[raw] ?? 'Unknown';
  return USER_ROLES.find((r) => r.toLowerCase() === raw.toLowerCase()) ?? 'Unknown';
}

export const fetchUsers = async (): Promise<User[]> => {
  const { data } = await apiClient.get<UserApiModel[]>('/User');
  return data.map((u) => ({ ...u, role: normalizeRole(u.role) }));
};

export interface CreateStaffInput {
  name: string;
  email: string;
  password: string;
  role: 'Conductor' | 'Driver' | 'Admin'; // register-staff takes the role as a string
}

export const registerStaff = async (input: CreateStaffInput) => {
  const { data } = await apiClient.post<{ message: string }>('/Auth/register-staff', input);
  return data;
};

export interface UpdateUserInput {
  id: number;
  name: string;
  role: KnownUserRole;
}

// PUT /User/{id} binds the enum from a number, so send the enum's numeric value
export const updateUser = async ({ id, name, role }: UpdateUserInput) => {
  await apiClient.put(`/User/${id}`, { name, role: USER_ROLES.indexOf(role) });
};

export const deleteUser = async (id: number) => {
  await apiClient.delete(`/User/${id}`);
};
