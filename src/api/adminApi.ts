import apiClient from './axiosClient';

// --- Types matching existing C# DTOs ---
export interface BookingRequestDto {
  commuterId: string;
  routeId: string;
  departureStation: string;
  arrivalStation: string;
  fareAmount: number;
}

export interface ActiveTripDto {
  commuterName: string;
  cardId: string;
  route: string;
  currentStation: string;
  status: string;
}

export interface BookTicketRequest {
  passengerName: string;
  smartCardId?: string;
  routeId: string;
  seatNumber?: string;
}

export interface CashSaleRequest {
  routeId: string;
  amountPaid: number;
  ticketTypeId: string;
  operatorId: string;
}

export interface PrintedTicketDto {
  ticketId: string;
  passengerName: string;
  routeName: string;
  issueDate: string;
  barcode: string;
  farePaid: number;
}

export interface ScanTicketRequest {
  ticketBarcode: string;
  scannerDeviceId: string;
  stationId: string;
}

export interface StartShiftRequest {
  driverId: string;
  vehicleUnitCode: string;
  startingOdometer: number;
}

export interface UpdateTicketStatusDto {
  ticketId: string;
  newStatus: 'ACTIVE' | 'USED' | 'CANCELLED' | 'REFUNDED';
  reason?: string;
}

// --- Types matching Admin & Fleet DTOs ---
export interface FleetVehicleDto {
  id: string | number;
  unitCode: string;
  fleetNumber?: string;
  driverName?: string;
  status?: 'IN_SERVICE' | 'MAINTENANCE' | string;
  fuelBatteryLevel?: number;
  isFixed?: boolean;
  route?: string;
  label?: string;
}

export interface CreateAccountRequest {
  fullName: string;
  email: string;
  role: 'Driver' | 'Commuter';
}

export interface UserAccountDto {
  id: string;
  fullName: string;
  email: string;
  role: string;
  status: string;
}

export interface RefundRequest {
  transactionId: string;
  amount: number;
}

// Helper function to extract array regardless of { data: [...] } wrapping
const unwrapData = <T>(responseData: any): T => {
  if (responseData && responseData.data !== undefined) {
    return responseData.data;
  }
  return responseData;
};

// --- Combined API Calls ---
export const adminApi = {
  getAccounts: async (): Promise<UserAccountDto[]> => {
    const response = await apiClient.get('admin/accounts');
    return unwrapData<UserAccountDto[]>(response.data);
  },

  createAccount: async (payload: CreateAccountRequest): Promise<void> => {
    await apiClient.post('admin/accounts/create', payload);
  },

  deactivateAccount: async (userId: string, reason: string): Promise<void> => {
    await apiClient.post('admin/accounts/deactivate', { userId, reason });
  },

  // Fleet Operations (FleetController.cs)
  getFleetStatus: async (): Promise<FleetVehicleDto[]> => {
    const response = await apiClient.get('fleet/buses/available');
    const rawList = unwrapData<any[]>(response.data);

    return (rawList || []).map((item) => ({
      id: item.id,
      unitCode: item.fleetNumber || item.unitCode || `BUS-${item.id}`,
      driverName: item.driverName || 'Unassigned',
      status: item.status || 'IN_SERVICE',
      fuelBatteryLevel: item.fuelBatteryLevel ?? 100,
      isFixed: item.isFixed ?? true,
      route: item.label || item.route || 'Active Route',
    }));
  },

  toggleVehicleFixedStatus: async (vehicleId: string | number, isFixed: boolean): Promise<void> => {
    await apiClient.put(`fleet/${vehicleId}/status`, {
      isFixed,
      status: isFixed ? 1 : 2, // BusStatus enum: 1 = Active, 2 = Maintenance
    });
  },

  // Operations & Active Trips
  toggleFareDiscount: async (active: boolean): Promise<void> => {
    await apiClient.post('admin/fare-discount', { active });
  },

  searchActiveTrips: async (query: string): Promise<ActiveTripDto[]> => {
    const response = await apiClient.get('admin/trips/active', {
      params: { query },
    });
    return unwrapData<ActiveTripDto[]>(response.data);
  },

  // Shift Operations (ConductorShiftController.cs)
  startShift: async (payload: StartShiftRequest): Promise<void> => {
    await apiClient.post('conductorshift/start', payload);
  },

  generateShiftReport: async (date: string): Promise<Blob> => {
    const response = await apiClient.get('conductorshift/reports', {
      params: { date },
      responseType: 'blob',
    });
    return response.data;
  },

  // Ticket Operations (TicketController.cs)
  processCashSale: async (payload: CashSaleRequest): Promise<PrintedTicketDto> => {
    const response = await apiClient.post('ticket/cash-sale', payload);
    return unwrapData<PrintedTicketDto>(response.data);
  },

  updateTicketStatus: async (payload: UpdateTicketStatusDto): Promise<void> => {
    await apiClient.put('ticket/status', payload);
  },

  processRefund: async (payload: RefundRequest): Promise<void> => {
    await apiClient.post('ticket/refund', payload);
  },
};
