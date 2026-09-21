// Mirrors UrbanLink_CRUD.Models.Enums.TicketStatus (Active = 0, Used = 1, Expired = 2)
export const TICKET_STATUSES = ['Active', 'Used', 'Expired'] as const;

export type KnownTicketStatus = (typeof TICKET_STATUSES)[number];
export type TicketStatus = KnownTicketStatus | 'Unknown';

// The shape the UI works with (status is always a readable string)
export interface Ticket {
  ticketId: number;
  qrCodeData: string;
  status: TicketStatus;
}
