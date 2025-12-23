import { API_BASE } from '../constants';
import { Company } from '../../types/company';

export type CompanyPayload = Omit<Company, 'id' | 'created_at' | 'updated_at'>;

export async function listCompanies(params?: {
  search?: string;
  page?: number;
  per_page?: number;
}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.per_page) qs.set('per_page', String(params.per_page));

  const res = await fetch(`${API_BASE}/companies?${qs.toString()}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function getCompany(id: string | number): Promise<Company> {
  const res = await fetch(`${API_BASE}/companies/${id}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function createCompany(payload: CompanyPayload): Promise<Company> {
  const res = await fetch(`${API_BASE}/companies`, {
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

export async function updateCompany(id: string | number, payload: Partial<CompanyPayload>): Promise<Company> {
  const res = await fetch(`${API_BASE}/companies/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function deleteCompany(id: string | number): Promise<boolean> {
  const res = await fetch(`${API_BASE}/companies/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await toError(res);
  return true;
}

async function toError(res: Response) {
  let detail: any = null;
  try { detail = await res.json(); } catch {}
  const err = new Error(`API Error: ${res.status}`) as any;
  err.status = res.status;
  err.detail = detail;
  return err;
}
