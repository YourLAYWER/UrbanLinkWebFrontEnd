// Keep these in sync with the C# DTOs.
export interface LoginRequest {
  email: string;
  password: string;
}

// AuthController.Login returns { token, role }
export interface LoginResponse {
  token: string;
  role: string;
}

export interface AuthUser {
  id?: string;
  name: string;
  email?: string;
  roles: string[];
}
