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
  console.log('Registering with AUTH_BASE:', `${AUTH_BASE}/register`);
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
  console.log('Logging in with AUTH_BASE:', `${AUTH_BASE}/login`);
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
  setCookie('auth_token', token, 7);
}

function setCookie(name: string, value: string, days: number) {
  let expires = "";
  if (days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}

async function toError(res: Response) {
  let detail: any = null;
  try { detail = await res.json(); } catch {}
  const err = new Error(`API ${res.status}`) as any;
  (err as any).status = res.status;
  (err as any).detail = detail;
  return err;
}
