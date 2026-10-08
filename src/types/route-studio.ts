// VERIFY: order assumed from TransitProviderController's error message
// ("Valid options are Bus, Train, Tram, Ferry, Subway."). Fix this one line if
// TransitType.cs is ordered differently.
export const TRANSIT_TYPES = ['Bus', 'Train', 'Tram', 'Ferry', 'Subway'] as const;
export type TransitTypeName = (typeof TRANSIT_TYPES)[number];

export interface Provider {
  id: number;
  name: string;
}

export interface Stop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  isTransferHub: boolean;
  isActive: boolean;
}

export interface RouteSummary {
  id: number;
  name: string;
}

export interface ScheduleEntry {
  scheduleId: number;
  daysOfOperation: string;
  firstDeparture: string; // "HH:mm"
  lastDeparture: string; // "HH:mm"
  frequencyMinutes: number;
}

export interface SegmentStop {
  stopId: number;
  stopName: string | null;
  sequence: number;
}

export interface RouteSegmentDetail {
  id: number;
  originStopId: number;
  destinationStopId: number;
  travelTimeMinutes: number;
  stops: SegmentStop[];
}

export interface RouteDetail {
  id: number;
  name: string;
  transportType: number | string;
  baseFare: number;
  providerId: number;
  providerName: string | null;
  schedules: ScheduleEntry[];
  segments: RouteSegmentDetail[];
}
