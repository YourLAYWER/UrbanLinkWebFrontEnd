import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useUpdateIncident } from '@/hooks/useIncidents';
import type { Incident } from '@/types/incident';

interface IncidentNotesDialogProps {
  incident: Incident | null;
  onClose: () => void;
}

export function IncidentNotesDialog({ incident, onClose }: IncidentNotesDialogProps) {
  const [notes, setNotes] = useState('');
  const updateIncident = useUpdateIncident();

  useEffect(() => {
    setNotes(incident?.adminNotes ?? '');
  }, [incident]);

  if (!incident) return null;

  const handleSave = () => {
    updateIncident.mutate(
      { id: incident.incidentID, status: incident.status, adminNotes: notes },
      { onSuccess: onClose }
    );
  };

  return (
    <Dialog open={!!incident} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Admin notes — Incident #{incident.incidentID}</DialogTitle>
        </DialogHeader>
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={5}
          placeholder="Add internal notes about this incident..."
        />
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={updateIncident.isPending}>
            {updateIncident.isPending ? 'Saving...' : 'Save Notes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
