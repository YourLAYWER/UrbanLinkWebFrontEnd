import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { LoaderCircle } from 'lucide-react';

import { FormError } from '@/components/FormError';
import { NativeSelect } from '@/components/NativeSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { routeMetadataSchema, type RouteMetadataValues } from '@/features/route-studio/schemas';
import { TRANSIT_TYPES, type Provider } from '@/types/route-studio';
import { getApiErrorMessage } from '@/lib/api-error';

interface RouteMetadataFormProps {
  providers: Provider[];
  defaultValues?: Partial<RouteMetadataValues>;
  submitLabel: string;
  isPending: boolean;
  error: unknown;
  onSubmit: (values: RouteMetadataValues) => void;
  onCancel?: () => void;
}

export function RouteMetadataForm({
  providers,
  defaultValues,
  submitLabel,
  isPending,
  error,
  onSubmit,
  onCancel,
}: RouteMetadataFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RouteMetadataValues>({
    resolver: zodResolver(routeMetadataSchema),
    defaultValues: {
      name: '',
      transportType: 'Bus',
      baseFare: 0,
      providerId: providers[0]?.id,
      isBidirectional: false,
      routeMapPath: '',
      ...defaultValues,
    },
  });

  const isBidirectional = watch('isBidirectional');

  return (
    <form
      onSubmit={handleSubmit(onSubmit, (formErrors) => console.log('Form errors:', formErrors))}
      className="space-y-4"
      noValidate
    >
      {error != null && <FormError message={getApiErrorMessage(error, 'Could not save the route.')} />}

      {Object.keys(errors).length > 0 && (
        <p className="text-sm text-destructive">Please check: {Object.keys(errors).join(', ')}</p>
      )}

      <div className="space-y-2">
        <Label htmlFor="route-name">Route name</Label>
        <Input id="route-name" aria-invalid={!!errors.name} {...register('name')} />
        {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="route-type">Transport type</Label>
          <NativeSelect id="route-type" {...register('transportType')}>
            {TRANSIT_TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="space-y-2">
          <Label htmlFor="route-provider">Provider</Label>
          <NativeSelect
            id="route-provider"
            {...register('providerId', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })}
          >
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </NativeSelect>
          {errors.providerId && <p className="text-sm text-destructive">{errors.providerId.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="route-fare">Base fare</Label>
        <Input
          id="route-fare"
          type="text"
          inputMode="decimal"
          aria-invalid={!!errors.baseFare}
          {...register('baseFare', { valueAsNumber: true })}
        />
        {errors.baseFare && <p className="text-sm text-destructive">{errors.baseFare.message}</p>}
      </div>

      <div className="flex items-center justify-between gap-4 rounded-md border p-3">
        <div className="space-y-0.5">
          <Label htmlFor="route-bidirectional">Two-way route</Label>
          <p className="text-xs text-muted-foreground">
            Off means the route only runs in one direction. On adds the return trip.
          </p>
        </div>
        <button
          id="route-bidirectional"
          type="button"
          role="switch"
          aria-checked={isBidirectional}
          onClick={() => setValue('isBidirectional', !isBidirectional, { shouldDirty: true })}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            isBidirectional ? 'bg-primary' : 'bg-muted-foreground/30'
          }`}
        >
          <span
            className={`inline-block size-5 rounded-full bg-background shadow transition-transform ${
              isBidirectional ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>

      <div className="space-y-2">
        <Label htmlFor="route-map-path">Route map path (optional)</Label>
        <textarea
          id="route-map-path"
          rows={4}
          placeholder="Paste the encoded polyline for this route"
          className="w-full rounded-md border bg-background px-3 py-2 font-mono-data text-xs"
          {...register('routeMapPath')}
        />
        <p className="text-xs text-muted-foreground">
          Routes without a map path do not show on the passenger map.
        </p>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isPending}>
          {isPending && <LoaderCircle className="animate-spin" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}