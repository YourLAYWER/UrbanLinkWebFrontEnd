export const adminApi = {
  // Fetch all fleet data from the backend FleetController
  getFleetStatus: async () => {
    const response = await fetch('/api/fleet', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch buses from FleetController');
    }

    const result = await response.json();
    const buses = result.data || result; // Handles { data: [...] } from C#

    // Map backend Bus properties to match FleetPage.tsx telemetry fields
    return buses.map(bus => {
      // Safely checks if the status string matches Active (case-insensitive)
      const isActive = bus.status && bus.status.toString().toLowerCase() === 'active';

      return {
        id: bus.id,
        unitCode: bus.fleetNumber,
        driverName: 'Assigned Unit',
        status: isActive ? 'IN_SERVICE' : 'MAINTENANCE',
        fuelBatteryLevel: 100,
        isFixed: isActive,
        route: `Capacity: ${bus.seatingCapacity} Seated / ${bus.standingCapacity} Standing`
      };
    });
  },

  // Toggle vehicle status by communicating with the backend PUT endpoint
  toggleVehicleFixedStatus: async (id, isFixed) => {
    const response = await fetch(`/api/fleet/${id}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ isFixed: isFixed })
    });

    if (!response.ok) {
      throw new Error('Failed to update vehicle status on the backend.');
    }

    return await response.json();
  },

  // Fetch available buses using the correct backend route path
  getAvailableBuses: async () => {
    const response = await fetch('/api/fleet/allbusesavailable', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch available buses from FleetController');
    }

    const result = await response.json();
    return result.data || result; 
  }
};