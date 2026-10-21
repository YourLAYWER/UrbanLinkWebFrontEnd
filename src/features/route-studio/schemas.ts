import { z } from 'zod';
import { TRANSIT_TYPES } from '@/types/route-studio';

export const routeMetadataSchema = z.object({
  name: z.string().trim().min(1, 'Route name is required').max(100),
  transportType: z.enum(TRANSIT_TYPES),
  baseFare: z.number().min(0, 'Base fare cannot be negative'),
  providerId: z.number().int().positive('Choose a provider'),
  isBidirectional: z.boolean(),
  routeMapPath: z.string().trim(),
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

export const segmentSchema = z
  .object({
    originStopId: z.number().int().positive('Choose an origin stop'),
    destinationStopId: z.number().int().positive('Choose a destination stop'),
    travelTimeMinutes: z.number().int().positive('Must be greater than 0'),
  })
  .refine((v) => v.originStopId !== v.destinationStopId, {
    message: 'Origin and destination must be different stops',
    path: ['destinationStopId'],
  });
export type SegmentValues = z.infer<typeof segmentSchema>;