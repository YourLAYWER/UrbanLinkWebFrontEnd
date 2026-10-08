import type { AuthUser } from '@/types/auth';

type JwtPayload = Record<string, unknown>;

// .NET emits either short claim names or the long Microsoft URIs,
// depending on how the token was built, so we check both.
const CLAIMS = {
  id: [
    'sub',
    'nameid',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier',
  ],
  name: [
    'unique_name',
    'name',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name',
  ],
  email: [
    'email',
    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
  ],
  role: [
    'role',
    'roles',
    'http://schemas.microsoft.com/ws/2008/06/identity/claims/role',
  ],
} as const;

export function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split('.')[1];
    if (!part) return null;
    const base64 = part.replace(/-/g, '+').replace(/_/g, '/');
    const binary = atob(base64);
    const json = decodeURIComponent(
      Array.from(binary, (c) => '%' + c.charCodeAt(0).toString(16).padStart(2, '0')).join('')
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function pickString(payload: JwtPayload, keys: readonly string[]): string | undefined {
  for (const key of keys) {
    const value = payload[key];
    if (typeof value === 'string' && value) return value;
  }
  return undefined;
}

function pickRoles(payload: JwtPayload): string[] {
  for (const key of CLAIMS.role) {
    const value = payload[key];
    if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
    if (typeof value === 'string' && value) return [value];
  }
  return [];
}

export function isTokenExpired(token: string): boolean {
  const exp = decodeJwt(token)?.exp;
  return typeof exp === 'number' && exp * 1000 <= Date.now();
}

export function getUserFromToken(token: string): AuthUser | null {
  const payload = decodeJwt(token);
  if (!payload) return null;

  const email = pickString(payload, CLAIMS.email);
  return {
    id: pickString(payload, CLAIMS.id),
    name: pickString(payload, CLAIMS.name) ?? email ?? 'Admin',
    email,
    roles: pickRoles(payload),
  };
}
