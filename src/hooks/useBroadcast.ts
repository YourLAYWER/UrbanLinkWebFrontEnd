import { useMutation } from '@tanstack/react-query';
import { sendBroadcast } from '@/api/broadcast';

export function useSendBroadcast() {
  return useMutation({
    mutationFn: sendBroadcast,
  });
}
