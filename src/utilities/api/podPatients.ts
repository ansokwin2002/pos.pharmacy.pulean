export type PodPatientPayload = {
  name: string;
  gender?: string | null;
  age?: number | null;
  telephone?: string | null;
  address?: string | null;
  signs_of_life?: string | null;
  symptom?: string | null;
  diagnosis?: string | null;
};

export type PodPatient = PodPatientPayload & { id: number };

import { API_BASE } from '@/utilities/constants';

export async function listPodPatients(params?: { search?: string; page?: number; per_page?: number }) {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.page) qs.set('page', String(params.page));
  if (params?.per_page) qs.set('per_page', String(params.per_page));
  const res = await fetch(`${API_BASE}/pod-patients${qs.toString() ? `?${qs.toString()}` : ''}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function createPodPatient(payload: PodPatientPayload) {
  const res = await fetch(`${API_BASE}/pod-patients`, {
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

export async function updatePodPatient(id: number | string, payload: Partial<PodPatientPayload>) {
  const res = await fetch(`${API_BASE}/pod-patients/${id}`, {
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

export async function deletePodPatient(id: number | string) {
  const res = await fetch(`${API_BASE}/pod-patients/${id}`, {
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
