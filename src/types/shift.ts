export interface Shift {
  shiftID: number;
  driverName: string;
  vehicleRegistration: string;
  route: string;
  startTime: string;
  status: 'Active' | 'Ended' | 'ForceClosed';
}
