export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved';

export interface Incident {
  incidentID: number;
  reportedByName: string;
  type: string;
  description: string;
  status: IncidentStatus;
  createdAt: string;
  adminNotes: string | null;
}

export interface UpdateIncidentPayload {
  id: number;
  status: IncidentStatus;
  adminNotes?: string;
}
