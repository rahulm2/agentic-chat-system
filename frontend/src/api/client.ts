const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';
const TOKEN_KEY = 'auth_token';

interface FetchOptions extends RequestInit {
  skipAuth?: boolean;
}

type ErrorListener = (status: number, message: string) => void;

let errorListener: ErrorListener | null = null;

export function setApiErrorListener(listener: ErrorListener | null): void {
  errorListener = listener;
}

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export async function apiFetch(path: string, options: FetchOptions = {}): Promise<Response> {
  const { skipAuth = false, headers: customHeaders, ...rest } = options;

  const headers = new Headers(customHeaders);
  const token = getAuthToken();

  if (!skipAuth && token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && rest.body && typeof rest.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers,
  });

  if (!response.ok && errorListener) {
    if (response.status === 401 && !skipAuth) {
      setAuthToken(null);
      errorListener(401, 'Session expired. Please log in again.');
    }
  }

  return response;
}
