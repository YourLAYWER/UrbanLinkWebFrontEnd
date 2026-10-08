import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle, Pencil, Plus, Trash2 } from 'lucide-react';

import { FormError } from '@/components/FormError';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { scheduleSchema, type ScheduleValues } from '@/features/route-studio/schemas';
import { useCreateSchedule, useDeleteSchedule, useUpdateSchedule } from '@/hooks/useRouteStudio';
import type { ScheduleEntry } from '@/types/route-studio';

function ScheduleForm({
  defaultValues,
  onSubmit,
  isPending,
  hasError,
  onCancel,
}: {
  defaultValues?: Partial<ScheduleValues>;
  onSubmit: (values: ScheduleValues) => void;
  isPending: boolean;
  hasError: boolean;
  onCancel: () => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ScheduleValues>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      daysOfOperation: 'Mon-Fri',
      firstDepartureTime: '06:00',
      lastDepartureTime: '22:00',
      frequencyMinutes: 15,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {hasError && <FormError message="Could not save the schedule." />}
      <div className="space-y-2">
        <Label htmlFor="sched-days">Days of operation</Label>
        <Input id="sched-days" placeholder="Mon-Fri" {...register('daysOfOperation')} />
        {errors.daysOfOperation && <p className="text-sm text-destructive">{errors.daysOfOperation.message}</p>}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sched-first">First departure</Label>
          <Input id="sched-first" placeholder="06:00" {...register('firstDepartureTime')} />
          {errors.firstDepartureTime && (
            <p className="text-sm text-destructive">{errors.firstDepartureTime.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="sched-last">Last departure</Label>
          <Input id="sched-last" placeholder="22:00" {...register('lastDepartureTime')} />
          {errors.lastDepartureTime && (
            <p className="text-sm text-destructive">{errors.lastDepartureTime.message}</p>
          )}
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="sched-freq">Frequency (minutes)</Label>
        <Input id="sched-freq" type="number" min="1" {...register('frequencyMinutes', { valueAsNumber: true })} />
        {errors.frequencyMinutes && <p className="text-sm text-destructive">{errors.frequencyMinutes.message}</p>}
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <LoaderCircle className="animate-spin" />}
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ScheduleManager({ routeId, schedules }: { routeId: number; schedules: ScheduleEntry[] }) {
  const [dialogState, setDialogState] = useState<'closed' | 'create' | number>('closed');
  const createMutation = useCreateSchedule(routeId);
  const updateMutation = useUpdateSchedule(routeId);
  const deleteMutation = useDeleteSchedule(routeId);

  const editing = typeof dialogState === 'number' ? schedules.find((s) => s.scheduleId === dialogState) : undefined;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Schedules ({schedules.length})</h3>
        <Button size="sm" variant="outline" onClick={() => setDialogState('create')}>
          <Plus className="size-3.5" />
          Add schedule
        </Button>
      </div>

      {schedules.length === 0 ? (
        <p className="text-sm text-muted-foreground">No schedules defined yet.</p>
      ) : (
        <ul className="space-y-2">
          {schedules.map((s) => (
            <li key={s.scheduleId} className="flex items-center justify-between rounded-md border p-2 text-sm">
              <div>
                <p className="font-medium">{s.daysOfOperation}</p>
                <p className="font-mono-data text-muted-foreground">
                  {s.firstDeparture}–{s.lastDeparture}, every {s.frequencyMinutes} min
                </p>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => setDialogState(s.scheduleId)}
                  aria-label="Edit schedule"
                >
                  <Pencil className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  onClick={() => deleteMutation.mutate(s.scheduleId)}
                  disabled={deleteMutation.isPending}
                  aria-label="Delete schedule"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <Dialog open={dialogState !== 'closed'} onOpenChange={(open) => !open && setDialogState('closed')}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit schedule' : 'Add schedule'}</DialogTitle>
          </DialogHeader>
          <ScheduleForm
            defaultValues={
              editing
                ? {
                    daysOfOperation: editing.daysOfOperation,
                    firstDepartureTime: editing.firstDeparture,
                    lastDepartureTime: editing.lastDeparture,
                    frequencyMinutes: editing.frequencyMinutes,
                  }
                : undefined
            }
            isPending={createMutation.isPending || updateMutation.isPending}
            hasError={createMutation.isError || updateMutation.isError}
            onCancel={() => setDialogState('closed')}
            onSubmit={(values) => {
              if (editing) {
                updateMutation.mutate(
                  { id: editing.scheduleId, payload: values },
                  { onSuccess: () => setDialogState('closed') }
                );
              } else {
                createMutation.mutate(values, { onSuccess: () => setDialogState('closed') });
              }
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
