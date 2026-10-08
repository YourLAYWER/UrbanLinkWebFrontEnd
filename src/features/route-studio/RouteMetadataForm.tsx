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
    formState: { errors },
  } = useForm<RouteMetadataValues>({
    resolver: zodResolver(routeMetadataSchema),
    defaultValues: {
      name: '',
      transportType: 'Bus',
      baseFare: 0,
      providerId: providers[0]?.id,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      {error != null && <FormError message={getApiErrorMessage(error, 'Could not save the route.')} />}

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
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="route-fare">Base fare</Label>
        <Input
          id="route-fare"
          type="number"
          step="0.01"
          min="0"
          aria-invalid={!!errors.baseFare}
          {...register('baseFare')}
        />
        {errors.baseFare && <p className="text-sm text-destructive">{errors.baseFare.message}</p>}
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
