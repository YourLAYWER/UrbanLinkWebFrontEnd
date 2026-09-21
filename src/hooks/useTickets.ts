import { useQuery } from '@tanstack/react-query';
import { fetchTickets } from '@/api/tickets';

export const ticketKeys = {
  all: ['tickets'] as const,
};

export const useTickets = () =>
  useQuery({
    queryKey: ticketKeys.all,
    queryFn: fetchTickets,
    refetchInterval: 30_000, // keep the monitoring view fresh
  });
