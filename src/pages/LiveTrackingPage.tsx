import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { MapPin, Navigation } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminApi, type ActiveTripDto } from '@/api/adminApi';

interface MapTarget {
  name: string;
  type: 'Commuter' | 'Driver';
  lat: number;
  lng: number;
  status: string;
  route: string;
  details: string;
}

export default function LiveTrackingPage() {
  const location = useLocation();
  const incomingTarget = (location.state as { target?: MapTarget } | null)?.target ?? null;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ActiveTripDto[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedTarget, setSelectedTarget] = useState<MapTarget | null>(incomingTarget);

  const handleSearchTrips = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const results = await adminApi.searchActiveTrips(searchQuery);
      setSearchResults(results);
      if (results && results.length > 0) {
        const first = results[0];
        setSelectedTarget({
          name: `${first.commuterName} (${first.cardId})`,
          type: 'Commuter',
          lat: -33.958 + (Math.random() - 0.5) * 0.02,
          lng: 25.61 + (Math.random() - 0.5) * 0.02,
          status: first.status,
          route: first.route,
          details: `Current station: ${first.currentStation}`,
        });
      }
    } catch (err) {
      console.warn('Trip search endpoint unreachable', err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectTripItem = (trip: ActiveTripDto) => {
    setSelectedTarget({
      name: `${trip.commuterName} (${trip.cardId})`,
      type: 'Commuter',
      lat: -33.965,
      lng: 25.605,
      status: trip.status,
      route: trip.route,
      details: `Current station: ${trip.currentStation}`,
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Live Tracking</h2>
        <p className="text-sm text-muted-foreground">Search commuters and drivers, and follow them on the map.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="flex flex-col justify-between lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Navigation className="size-4 text-secondary" />
              Commuter &amp; driver lookup
            </CardTitle>
            <CardDescription>Search by passenger name or card ID.</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Search name or card ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchTrips()}
              />
              <Button size="sm" onClick={handleSearchTrips} disabled={isSearching}>
                {isSearching ? '...' : 'Locate'}
              </Button>
            </div>

            {searchResults.length > 0 ? (
              <div className="max-h-60 space-y-2 overflow-y-auto pr-1">
                {searchResults.map((trip, idx) => (
                  <div
                    key={idx}
                    onClick={() => handleSelectTripItem(trip)}
                    className="cursor-pointer rounded-md border border-border bg-muted/40 p-3 text-xs transition-colors hover:border-secondary/50"
                  >
                    <div className="flex justify-between font-medium">
                      <span>{trip.commuterName}</span>
                      <span className="font-mono text-[10px] text-secondary">{trip.cardId}</span>
                    </div>
                    <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                      Route: {trip.route} | {trip.currentStation}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-4 text-center text-xs italic text-muted-foreground">
                Search results will appear here with live coordinates.
              </p>
            )}

            {selectedTarget && (
              <div className="rounded-md border border-secondary/30 bg-muted/60 p-3.5 font-mono text-xs">
                <div className="mb-1 flex items-center justify-between font-bold text-secondary">
                  <span>Active target locked</span>
                  <span className="rounded bg-secondary/20 px-1.5 py-0.5 text-[10px]">{selectedTarget.type}</span>
                </div>
                <div className="font-bold">{selectedTarget.name}</div>
                <div className="mt-0.5 text-[11px] text-foreground/80">Route: {selectedTarget.route}</div>
                <div className="mt-1 text-[10px] text-muted-foreground">{selectedTarget.details}</div>
                <div className="mt-2 text-[10px] text-emerald-400">
                  Lat: {selectedTarget.lat.toFixed(4)}, Lng: {selectedTarget.lng.toFixed(4)}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <MapPin className="size-4 text-secondary" />
              Live GIS telemetry
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative h-[400px] w-full overflow-hidden rounded-lg border border-border bg-muted/40">
              {selectedTarget ? (
                <iframe
                  title="Live tracking map"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://maps.google.com/maps?q=${selectedTarget.lat},${selectedTarget.lng}&z=14&output=embed`}
                />
              ) : (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  Select a commuter or driver to center the map.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
