import { z } from 'zod';
import { STAFF_ROLES, USER_ROLES } from '@/types/user';

// Mirror the validation rules of RegisterStaffRequestDto here.
export const createStaffSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(8, 'Use at least 8 characters'),
  role: z.enum(STAFF_ROLES),
});
export type CreateStaffValues = z.infer<typeof createStaffSchema>;

export const editUserSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name is too long'),
  role: z.enum(USER_ROLES),
});
export type EditUserValues = z.infer<typeof editUserSchema>;
