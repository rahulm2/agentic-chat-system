import { apiFetch } from './client';

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  preferences: unknown;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
  name?: string;
}

export async function login(params: LoginParams): Promise<AuthResponse> {
  const response = await apiFetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(params),
    skipAuth: true,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Login failed' }));
    throw new Error((err as { message?: string }).message ?? `HTTP ${response.status}`);
  }
  return response.json() as Promise<AuthResponse>;
}

export async function register(params: RegisterParams): Promise<AuthResponse> {
  const response = await apiFetch('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(params),
    skipAuth: true,
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({ message: 'Registration failed' }));
    throw new Error((err as { message?: string }).message ?? `HTTP ${response.status}`);
  }
  return response.json() as Promise<AuthResponse>;
}

export async function fetchCurrentUser(): Promise<User> {
  const response = await apiFetch('/api/auth/me');
  if (!response.ok) {
    throw new Error(`Failed to fetch user: ${response.status}`);
  }
  return response.json() as Promise<User>;
}
