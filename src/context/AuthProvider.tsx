import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { loginRequest } from '@/api/auth';
import { AccessDeniedError } from '@/lib/auth-errors';
import { getUserFromToken, isTokenExpired } from '@/lib/jwt';
import { AuthContext, type AuthContextValue } from '@/context/auth-context';
import type { AuthUser, LoginRequest } from '@/types/auth';

// Only Admin accounts may use this UI. This is a convenience check:
// the real enforcement must be [Authorize(Roles = "Admin")] on the API.
const ADMIN_ROLE = 'Admin';

function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

function readStoredUser(): AuthUser | null {
  const token = localStorage.getItem('accessToken');
  if (!token) return null;

  const user = getUserFromToken(token);
  if (!user || isTokenExpired(token) || !user.roles.includes(ADMIN_ROLE)) {
    clearSession();
    return null;
  }
  return user;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const [user, setUser] = useState<AuthUser | null>(readStoredUser);

  const login = useCallback(async (credentials: LoginRequest) => {
    const { token } = await loginRequest(credentials);

    const nextUser = token ? getUserFromToken(token) : null;
    if (!nextUser) throw new Error('Server returned an invalid token');
    if (!nextUser.roles.includes(ADMIN_ROLE)) throw new AccessDeniedError();

    localStorage.setItem('accessToken', token);
    setUser(nextUser);
  }, []);

  const logout = useCallback(() => {
    clearSession();
    queryClient.clear(); // drop cached data from the previous session
    setUser(null);
  }, [queryClient]);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, login, logout }),
    [user, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
