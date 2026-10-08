import axios, { type AxiosError } from 'axios';

const API_URL: string =
  import.meta.env.VITE_API_BASE_URL || 'https://localhost:7252/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// The login call itself returns 401 for a wrong password.
// That must show an error on the form, not trigger a logout redirect.
const isLoginCall = (url?: string) => /\/Auth\/login/i.test(url ?? '');

// Attach the current token to every request
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// The API has no refresh endpoint yet (tokens last 40 minutes), so an
// expired or invalid token means the user must sign in again.
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 && !isLoginCall(error.config?.url)) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
