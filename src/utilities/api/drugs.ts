import { API_BASE } from '../constants';
import { Drug, DrugStatus } from '../../types/inventory';

export type DrugPayload = Omit<Drug, 'id' | 'created_at' | 'updated_at' | 'slug'> & { slug?: string };

export async function listDrugs(params?: {
  search?: string;
  status?: DrugStatus;
  category_id?: number;
  brand_id?: number;
  in_stock?: boolean;
  expiring_soon?: boolean;
  expiring_days?: number;
  page?: number;
  per_page?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
}) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.status) qs.set('status', params.status);
  if (params?.category_id) qs.set('category_id', String(params.category_id));
  if (params?.brand_id) qs.set('brand_id', String(params.brand_id));
  if (params?.in_stock) qs.set('in_stock', String(params.in_stock));
  if (params?.expiring_soon) qs.set('expiring_soon', String(params.expiring_soon));
  if (params?.expiring_days) qs.set('expiring_days', String(params.expiring_days));
  if (params?.page) qs.set('page', String(params.page));
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  if (params?.sort_by) qs.set('sort_by', params.sort_by);
  if (params?.sort_dir) qs.set('sort_dir', params.sort_dir);

  const res = await fetch(`${API_BASE}/drugs${qs.toString() ? `?${qs.toString()}` : ''}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function getDrug(id: string | number) {
  const res = await fetch(`${API_BASE}/drugs/${id}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function createDrug(payload: DrugPayload) {
  const res = await fetch(`${API_BASE}/drugs`, {
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

export async function updateDrug(id: string | number, payload: Partial<DrugPayload>) {
  const res = await fetch(`${API_BASE}/drugs/${id}`, {
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

export async function deleteDrug(id: string | number) {
  const res = await fetch(`${API_BASE}/drugs/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await toError(res);
  return true;
}

async function toError(res: Response) {
  let detail: any = null;
  try { detail = await res.json(); } catch {}
  const err = new Error(`API ${res.status}`) as any;
  err.status = res.status;
  err.detail = detail;
  return err;
}
