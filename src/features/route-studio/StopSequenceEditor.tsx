import { useState } from 'react';
import { ArrowDown, ArrowUp, Pencil, Trash2 } from 'lucide-react';

import { NativeSelect } from '@/components/NativeSelect';
import { Button } from '@/components/ui/button';
import {
  useDeleteSegment,
  useRemoveStop,
  useReorderStops,
  useUpdateSegment,
} from '@/hooks/useRouteStudio';
import type { RouteSegmentDetail, Stop } from '@/types/route-studio';

interface StopSequenceEditorProps {
  routeId: number;
  segment: RouteSegmentDetail;
  allStops: Stop[];
}

export function StopSequenceEditor({ routeId, segment, allStops }: StopSequenceEditorProps) {
  const reorder = useReorderStops(routeId);
  const removeStop = useRemoveStop(routeId);
  const updateSegment = useUpdateSegment(routeId);
  const deleteSegment = useDeleteSegment(routeId);

  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [originId, setOriginId] = useState<number>(segment.originStopId);
  const [destinationId, setDestinationId] = useState<number>(segment.destinationStopId);
  const [minutes, setMinutes] = useState<number>(segment.travelTimeMinutes);
  const [error, setError] = useState<string | null>(null);

  const ordered = [...segment.stops].sort((a, b) => a.sequence - b.sequence);

  const stopName = (id: number) => allStops.find((s) => s.id === id)?.name ?? `Stop #${id}`;
  const label = `${stopName(segment.originStopId)} → ${stopName(segment.destinationStopId)}`;

  function startEditing() {
    setOriginId(segment.originStopId);
    setDestinationId(segment.destinationStopId);
    setMinutes(segment.travelTimeMinutes);
    setError(null);
    setIsEditing(true);
  }

  function saveEdit() {
    if (originId === destinationId) {
      setError('Origin and destination must be different.');
      return;
    }
    if (!minutes || minutes <= 0) {
      setError('Travel time must be more than 0 minutes.');
      return;
    }
    setError(null);
    updateSegment.mutate(
      {
        id: segment.id,
        payload: { originStopId: originId, destinationStopId: destinationId, travelTimeMinutes: minutes },
      },
      {
        onSuccess: () => setIsEditing(false),
        onError: () => setError('Could not save the segment. Please try again.'),
      },
    );
  }

  function handleDelete() {
    if (!window.confirm(`Delete segment "${label}"? This also removes its stops.`)) return;
    deleteSegment.mutate(segment.id, {
      onError: () => setError('Could not delete the segment. Please try again.'),
    });
  }

  function move(index: number, direction: -1 | 1) {
    const next = [...ordered];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate({ segmentId: segment.id, orderedStopIds: next.map((s) => s.stopId) });
  }

  return (
    <div className="space-y-2 rounded-md border p-3">
      {isEditing ? (
        <div className="space-y-2 rounded bg-muted/40 p-2">
          <div className="grid gap-2 sm:grid-cols-2">
            <NativeSelect
              value={originId}
              onChange={(e) => setOriginId(Number(e.target.value))}
              aria-label="Origin stop"
            >
              {allStops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </NativeSelect>
            <NativeSelect
              value={destinationId}
              onChange={(e) => setDestinationId(Number(e.target.value))}
              aria-label="Destination stop"
            >
              {allStops.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </NativeSelect>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              value={minutes}
              onChange={(e) => setMinutes(Number(e.target.value))}
              className="h-9 w-24 rounded-md border bg-background px-2 text-sm"
              aria-label="Travel time in minutes"
            />
            <span className="text-xs text-muted-foreground">minutes</span>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={saveEdit} disabled={updateSegment.isPending}>
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="font-mono-data text-xs text-muted-foreground">
            {label} · {segment.travelTimeMinutes} min
          </p>
          <span className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              onClick={startEditing}
              aria-label="Edit segment"
            >
              <Pencil className="size-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="size-7"
              disabled={deleteSegment.isPending}
              onClick={handleDelete}
              aria-label="Delete segment"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </span>
        </div>
      )}

      {!isEditing && error && <p className="text-xs text-destructive">{error}</p>}

      {ordered.length > 0 && (
        <ol className="space-y-1">
          {ordered.map((stop, index) => (
            <li
              key={stop.stopId}
              className="flex items-center justify-between gap-2 rounded bg-muted/40 px-2 py-1.5 text-sm"
            >
              <span className="flex items-center gap-2">
                <span className="w-5 text-right font-mono-data text-xs text-muted-foreground">{index + 1}</span>
                {stop.stopName ?? `Stop #${stop.stopId}`}
              </span>
              <span className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={index === 0 || reorder.isPending}
                  onClick={() => move(index, -1)}
                  aria-label="Move up"
                >
                  <ArrowUp className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={index === ordered.length - 1 || reorder.isPending}
                  onClick={() => move(index, 1)}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  disabled={removeStop.isPending}
                  onClick={() => removeStop.mutate({ segmentId: segment.id, stopId: stop.stopId })}
                  aria-label="Remove stop"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

