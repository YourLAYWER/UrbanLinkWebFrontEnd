import { BroadcastForm } from '@/features/broadcast/BroadcastForm';

export default function BroadcastAlertPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Broadcast Alert</h2>
        <p className="text-sm text-muted-foreground">
          Push a message to all users, or to commuters currently ticketed on a specific route segment.
        </p>
      </div>

      <BroadcastForm />
    </div>
  );
}
