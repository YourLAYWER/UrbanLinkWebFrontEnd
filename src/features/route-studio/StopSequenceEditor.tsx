import { useState } from 'react';
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react';

import { NativeSelect } from '@/components/NativeSelect';
import { Button } from '@/components/ui/button';
import { useAddStop, useRemoveStop, useReorderStops } from '@/hooks/useRouteStudio';
import type { RouteSegmentDetail, Stop } from '@/types/route-studio';

interface StopSequenceEditorProps {
  routeId: number;
  segment: RouteSegmentDetail;
  allStops: Stop[];
}

// MVP reordering: plain up/down buttons calling the reorder endpoint, rather
// than a drag-and-drop library. Each segment's stop list is independent,
// matching the RouteSegment -> RouteStop model as it exists on the backend.
export function StopSequenceEditor({ routeId, segment, allStops }: StopSequenceEditorProps) {
  const reorder = useReorderStops(routeId);
  const removeStop = useRemoveStop(routeId);
  const addStop = useAddStop(routeId);
  const [selectedStopId, setSelectedStopId] = useState<number | ''>('');

  const ordered = [...segment.stops].sort((a, b) => a.sequence - b.sequence);
  const availableStops = allStops.filter((s) => !ordered.some((o) => o.stopId === s.id));

  function move(index: number, direction: -1 | 1) {
    const next = [...ordered];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    reorder.mutate({ segmentId: segment.id, orderedStopIds: next.map((s) => s.stopId) });
  }

  return (
    <div className="space-y-2 rounded-md border p-3">
      <p className="font-mono-data text-xs text-muted-foreground">
        Segment #{segment.id} · {segment.travelTimeMinutes} min
      </p>

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
        {ordered.length === 0 && <li className="text-sm text-muted-foreground">No stops on this segment yet.</li>}
      </ol>

      <div className="flex gap-2 pt-1">
        <NativeSelect
          value={selectedStopId}
          onChange={(e) => setSelectedStopId(e.target.value ? Number(e.target.value) : '')}
          className="flex-1"
          aria-label="Add a stop"
        >
          <option value="">Add a stop...</option>
          {availableStops.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </NativeSelect>
        <Button
          size="sm"
          variant="outline"
          disabled={!selectedStopId || addStop.isPending}
          onClick={() => {
            if (selectedStopId) {
              addStop.mutate({ segmentId: segment.id, stopId: selectedStopId });
              setSelectedStopId('');
            }
          }}
        >
          <Plus className="size-3.5" />
          Add
        </Button>
      </div>
    </div>
  );
}
