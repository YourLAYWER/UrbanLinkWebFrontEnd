// Order MUST match UrbanLink_CRUD.Models.Enums.Role
// (Admin = 0, Student = 1, Conductor = 2, Driver = 3, StandardUser = 4)
export const USER_ROLES = ['Admin', 'Student', 'Conductor', 'Driver', 'StandardUser'] as const;

// Roles the register-staff endpoint accepts
export const STAFF_ROLES = ['Conductor', 'Driver', 'Admin'] as const;

export type KnownUserRole = (typeof USER_ROLES)[number];
export type UserRole = KnownUserRole | 'Unknown';

export const ROLE_LABELS: Record<UserRole, string> = {
  Admin: 'Admin',
  Student: 'Student',
  Conductor: 'Conductor',
  Driver: 'Driver',
  StandardUser: 'Standard user',
  Unknown: 'Unknown',
};

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}
