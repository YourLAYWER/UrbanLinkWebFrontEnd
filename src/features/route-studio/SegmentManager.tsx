import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Plus } from 'lucide-react';

import { FormError } from '@/components/FormError';
import { NativeSelect } from '@/components/NativeSelect';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { segmentSchema, type SegmentValues } from '@/features/route-studio/schemas';
import { useCreateSegment } from '@/hooks/useRouteStudio';
import { getApiErrorMessage } from '@/lib/api-error';
import type { Stop } from '@/types/route-studio';

function SegmentForm({
  allStops,
  onSubmit,
  isPending,
  error,
  onCancel,
}: {
  allStops: Stop[];
  onSubmit: (values: SegmentValues) => void;
  isPending: boolean;
  error: unknown;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SegmentValues>({
    resolver: zodResolver(segmentSchema),
    defaultValues: {
      originStopId: allStops[0]?.id,
      destinationStopId: allStops[1]?.id ?? allStops[0]?.id,
      travelTimeMinutes: 5,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error != null && <FormError message={getApiErrorMessage(error, 'Could not create the segment.')} />}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="segment-origin">Origin stop</Label>
          <NativeSelect
            id="segment-origin"
            {...register('originStopId', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
          >
            {allStops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </NativeSelect>
          {errors.originStopId && <p className="text-sm text-destructive">{errors.originStopId.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="segment-destination">Destination stop</Label>
          <NativeSelect
            id="segment-destination"
            {...register('destinationStopId', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
          >
            {allStops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </NativeSelect>
          {errors.destinationStopId && (
            <p className="text-sm text-destructive">{errors.destinationStopId.message}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="segment-time">Travel time (minutes)</Label>
        <Input id="segment-time" type="number" min="1" {...register('travelTimeMinutes', { valueAsNumber: true })} />
        {errors.travelTimeMinutes && (
          <p className="text-sm text-destructive">{errors.travelTimeMinutes.message}</p>
        )}
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <LoaderCircle className="animate-spin" />}
          Add segment
        </Button>
      </DialogFooter>
    </form>
  );
}

export function SegmentManager({ routeId, allStops }: { routeId: number; allStops: Stop[] }) {
  const [open, setOpen] = useState(false);
  const createMutation = useCreateSegment(routeId);

  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)} disabled={allStops.length < 2}>
        <Plus className="size-3.5" />
        Add segment
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New route segment</DialogTitle>
          </DialogHeader>
          <SegmentForm
            allStops={allStops}
            isPending={createMutation.isPending}
            error={createMutation.error}
            onCancel={() => setOpen(false)}
            onSubmit={(values) => createMutation.mutate(values, { onSuccess: () => setOpen(false) })}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}