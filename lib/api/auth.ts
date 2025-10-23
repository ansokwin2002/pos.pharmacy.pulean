// lib/api/auth.ts
'use client';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:8000/api';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

type LoginInput = {
  email: string;
  password: string;
};

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('auth_token');
}

function setToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('auth_token', token);
}

function clearToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('auth_token');
}

async function request(path: string, options: RequestInit = {}) {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const contentType = res.headers.get('content-type') || '';
  const data = contentType.includes('application/json') ? await res.json().catch(() => null) : null;

  if (!res.ok) {
    const message = (data && (data.message || JSON.stringify(data))) || res.statusText;
    throw new Error(message);
  }

  return data;
}

export async function register(input: RegisterInput) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (data?.token) setToken(data.token);
  return data;
}

export async function login(input: LoginInput) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  if (data?.token) setToken(data.token);
  return data;
}

export async function me() {
  return request('/auth/me', { method: 'GET' });
}

export async function logout() {
  try {
    await request('/auth/logout', { method: 'POST' });
  } finally {
    clearToken();
  }
}

export function isAuthenticated() {
  return !!getToken();
}

export function getAuthToken() {
  return getToken();
}
