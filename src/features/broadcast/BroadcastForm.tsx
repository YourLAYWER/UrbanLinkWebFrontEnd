import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useSendBroadcast } from '@/hooks/useBroadcast';
import { getApiErrorMessage } from '@/lib/api-error';

export function BroadcastForm() {
  const [message, setMessage] = useState('');
  const [routeSegmentId, setRouteSegmentId] = useState('');
  const broadcastMutation = useSendBroadcast();

  const handleSend = () => {
    if (!message.trim()) return;
    broadcastMutation.mutate(
      {
        message: message.trim(),
        routeSegmentID: routeSegmentId.trim() ? Number(routeSegmentId) : undefined,
      },
      {
        onSuccess: () => {
          setMessage('');
          setRouteSegmentId('');
        },
      }
    );
  };

  return (
    <div className="space-y-4 max-w-xl">
      <div className="space-y-2">
        <Label htmlFor="broadcast-message">Alert message</Label>
        <Textarea
          id="broadcast-message"
          placeholder="e.g. Route 1 suspended due to severe weather. Please use Route 2 as an alternative."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="route-segment">
          Route Segment ID <span className="text-muted-foreground">(optional — leave blank to notify all users)</span>
        </Label>
        <Input
          id="route-segment"
          type="number"
          placeholder="e.g. 3"
          value={routeSegmentId}
          onChange={(e) => setRouteSegmentId(e.target.value)}
        />
      </div>

      <Button onClick={handleSend} disabled={broadcastMutation.isPending || !message.trim()}>
        {broadcastMutation.isPending ? 'Sending...' : 'Send Alert'}
      </Button>

      {broadcastMutation.isSuccess && (
        <p className="text-sm text-muted-foreground">
          Sent to {broadcastMutation.data.recipientCount} recipient
          {broadcastMutation.data.recipientCount === 1 ? '' : 's'}.
        </p>
      )}

      {broadcastMutation.isError && (
        <p className="text-sm text-destructive">
          {getApiErrorMessage(broadcastMutation.error, 'Failed to send broadcast.')}
        </p>
      )}
    </div>
  );
}
