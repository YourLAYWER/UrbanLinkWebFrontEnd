import { z } from 'zod';
import { TRANSIT_TYPES } from '@/types/route-studio';

// No z.coerce here on purpose: newer @hookform/resolvers versions require the
// zod schema's input and output types to match exactly when the schema is
// passed straight to useForm's generic. z.coerce makes the input type
// "unknown" and the output type "number", which conflicts. Instead, the
// string-to-number conversion happens in the form via valueAsNumber /
// setValueAs (see RouteMetadataForm.tsx and ScheduleManager.tsx), so by the
// time values reach this schema they're already numbers.
export const routeMetadataSchema = z.object({
  name: z.string().trim().min(1, 'Route name is required').max(100),
  transportType: z.enum(TRANSIT_TYPES),
  baseFare: z.number().min(0, 'Base fare cannot be negative'),
  providerId: z.number().int().positive('Choose a provider'),
});
export type RouteMetadataValues = z.infer<typeof routeMetadataSchema>;

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

export const scheduleSchema = z.object({
  daysOfOperation: z.string().trim().min(1, 'Required, e.g. "Mon-Fri"'),
  firstDepartureTime: z.string().regex(timePattern, 'Use HH:mm, e.g. 06:00'),
  lastDepartureTime: z.string().regex(timePattern, 'Use HH:mm, e.g. 22:00'),
  frequencyMinutes: z.number().int().positive('Must be greater than 0'),
});
export type ScheduleValues = z.infer<typeof scheduleSchema>;
