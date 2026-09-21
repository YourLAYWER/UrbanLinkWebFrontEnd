import { isAxiosError } from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (!isAxiosError(error)) return fallback;

  // No response at all: server down, CORS, or untrusted dev certificate
  if (!error.response) {
    return 'Cannot reach the server. Check that the API is running and try again.';
  }

  const data = error.response.data as { message?: string; title?: string } | undefined;
  return data?.message ?? data?.title ?? fallback;
}
