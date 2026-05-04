const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

export function getAuthToken(): string | null {
  return authToken;
}

export async function apiFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);

  if (!skipAuth && authToken) {
    headers.set('Authorization', `Bearer ${authToken}`);
  }

  if (!headers.has('Content-Type') && rest.body && typeof rest.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
  });

  return response;
}
