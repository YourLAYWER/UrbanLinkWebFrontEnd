import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, RefreshCw, Search } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi, type FleetVehicleDto } from '@/api/adminApi';

const FALLBACK_FLEET: FleetVehicleDto[] = [
  { id: '1', unitCode: 'BUS-4412', driverName: 'Jackson Cole', status: 'Active', fuelBatteryLevel: 84, isFixed: true, route: 'Line 4 Crosstown' },
  { id: '2', unitCode: 'TR-204', driverName: 'Elena Rostova', status: 'InMaintenance', fuelBatteryLevel: 32, isFixed: false, route: 'Line 1 Loop' },
];

export default function FleetPage() {
  const navigate = useNavigate();
  const [fleet, setFleet] = useState<FleetVehicleDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // 1. New search query state variable
  const [searchQuery, setSearchQuery] = useState('');

  const loadFleetData = async () => {
    setIsRefreshing(true);
    try {
      const data = await adminApi.getAllFleet();
      setFleet(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn('Fleet endpoint unreachable, showing fallback telemetry', err);
      setFleet(FALLBACK_FLEET);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadFleetData();
  }, []);

  const handleStatusChange = async (id: string | number, newStatus: string) => {
    const isNowFixed = newStatus === 'Active';

    // Optimistically update frontend state
    setFleet((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: newStatus, isFixed: isNowFixed } : v))
    );

    try {
      await adminApi.updateBusStatus(id, newStatus);
    } catch (err) {
      console.warn('Failed to persist status change, reverting...', err);
      loadFleetData(); // Roll back to server truth on failure
    }
  };

  const handleTrackOnMap = (vehicle: FleetVehicleDto) => {
    navigate('/tracking', {
      state: {
        target: {
          name: `${vehicle.driverName || 'Driver'} (${vehicle.unitCode})`,
          type: 'Driver',
          lat: -33.9608 + (Math.random() - 0.5) * 0.01,
          lng: 25.6022 + (Math.random() - 0.5) * 0.01,
          status: vehicle.status,
          route: vehicle.route,
          details: `Fuel/Battery: ${vehicle.fuelBatteryLevel}% | Status: ${vehicle.status}`,
        },
      },
    });
  };

  // 2. Filter fleet items dynamically based on the search query input
  const filteredFleet = fleet.filter((vehicle) => {
    const query = searchQuery.toLowerCase();
    const unit = (vehicle.unitCode || '').toLowerCase();
    const driver = (vehicle.driverName || '').toLowerCase();
    const route = (vehicle.route || '').toLowerCase();
    const status = (vehicle.status || '').toLowerCase();

    return unit.includes(query) || driver.includes(query) || route.includes(query) || status.includes(query);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Fleet &amp; Telemetry</h2>
          <p className="text-sm text-muted-foreground">Vehicle status, driver assignment, and maintenance flags from backend database.</p>
        </div>
        <Button variant="outline" size="sm" onClick={loadFleetData} disabled={isRefreshing}>
          <RefreshCw className={isRefreshing ? 'animate-spin' : undefined} />
          Refresh
        </Button>
      </div>

      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base">Fleet Telemetry</CardTitle>
              <CardDescription>
                Showing {filteredFleet.length} of {fleet.length} vehicle{fleet.length === 1 ? '' : 's'}
              </CardDescription>
            </div>

            {/* 3. Search Bar Input Element */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search bus, driver, route..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && (
            <div className="space-y-3">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          )}

          {!isLoading &&
            filteredFleet.map((vehicle) => (
              <div
                key={vehicle.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/40 p-4"
              >
                <div>
                  <span className="font-mono text-sm font-bold">{vehicle.unitCode}</span>
                  <div className="mt-1 text-xs text-muted-foreground">
                    Driver: {vehicle.driverName || 'Unassigned'} | Route: {vehicle.route || 'Not assigned'}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Status Selection Dropdown restricted strictly to Active and InMaintenance */}
                  <select
                    value={vehicle.status || 'Active'}
                    onChange={(e) => handleStatusChange(vehicle.id, e.target.value)}
                    className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  >
                    <option value="Active">Active</option>
                    <option value="InMaintenance">In Maintenance</option>
                  </select>

                  <Button variant="outline" size="sm" onClick={() => handleTrackOnMap(vehicle)}>
                    <MapPin className="size-3.5" />
                    Track on map
                  </Button>
                </div>
              </div>
            ))}

          {!isLoading && filteredFleet.length === 0 && (
            <p className="py-6 text-center text-sm text-muted-foreground">
              {searchQuery ? `No vehicles matched "${searchQuery}".` : 'No vehicles found.'}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}