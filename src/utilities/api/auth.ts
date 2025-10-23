import { API_BASE } from '@/utilities/constants';
const AUTH_BASE = `${API_BASE}/auth`;

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type AuthResponse = {
  message: string;
  access_token: string;
  token_type: string; // 'Bearer'
};

export async function register(payload: RegisterPayload): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_BASE}/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const res = await fetch(`${AUTH_BASE}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export function saveAuth(token: string) {
  localStorage.setItem('auth_token', token);
}

async function toError(res: Response) {
  let detail: any = null;
  try { detail = await res.json(); } catch {}
  const err = new Error(`API ${res.status}`) as any;
  (err as any).status = res.status;
  (err as any).detail = detail;
  return err;
}
