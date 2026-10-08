import apiClient from '@/api/axiosClient';
import { TICKET_STATUSES, type Ticket, type TicketStatus } from '@/types/ticket';

// What TicketController actually returns. Without a JsonStringEnumConverter on
// the API, the enum arrives as a number, so we accept a number or a string.
interface TicketApiModel {
  ticketId: number;
  qrCodeData: string;
  status: number | string;
}

function normalizeStatus(raw: number | string): TicketStatus {
  if (typeof raw === 'number') return TICKET_STATUSES[raw] ?? 'Unknown';
  return TICKET_STATUSES.find((s) => s.toLowerCase() === raw.toLowerCase()) ?? 'Unknown';
}

export const fetchTickets = async (): Promise<Ticket[]> => {
  const { data } = await apiClient.get<TicketApiModel[]>('/Ticket');
  return data.map((t) => ({
    ticketId: t.ticketId,
    qrCodeData: t.qrCodeData,
    status: normalizeStatus(t.status),
  }));
};
