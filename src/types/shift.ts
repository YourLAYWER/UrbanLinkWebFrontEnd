export interface Shift {
  id: number; // Changed to match C# JSON output
  driverName: string;
  vehicleRegistration: string;
  route: string;
  startTime: string;
  endTime?: string | null;
  status: 'Active' | 'Closed';
}