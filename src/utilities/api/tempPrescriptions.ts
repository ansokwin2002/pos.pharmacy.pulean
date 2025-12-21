import { API_BASE } from '@/utilities/constants';

export type TempPrescriptionPayload = {
  json_data?: string; // JSON string containing prescription data
  drugs?: any[]; // For the new API
};

export async function createTempPrescriptionOld(payload: TempPrescriptionPayload) {
  const res = await fetch(`${API_BASE}/temp-prescriptions`, {
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

export async function createTempPrescriptionForPatient(patientId: string, drugs: any[]) {
  const res = await fetch(`${API_BASE}/temp-prescriptions/patient/${patientId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify({ drugs }),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function listTempPrescriptions(patientId: string) {
  const res = await fetch(`${API_BASE}/temp-prescriptions/patient/${patientId}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function getTempPrescription(id: string) {
  const res = await fetch(`${API_BASE}/temp-prescriptions/${id}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function updateTempPrescription(id: string, payload: TempPrescriptionPayload) {
  const res = await fetch(`${API_BASE}/temp-prescriptions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function deleteTempPrescription(id: string) {
  const res = await fetch(`${API_BASE}/temp-prescriptions/${id}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function deleteTempPrescriptionsByPatientId(patientId: string) {
  const res = await fetch(`${API_BASE}/temp-prescriptions/patient/${patientId}`, {
    method: 'DELETE',
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

async function toError(res: Response) {
  let detail: any = null;
  try { detail = await res.json(); } catch {}
  const err = new Error(`API ${res.status}`) as any;
  err.status = res.status;
  err.detail = detail;
  return err;
}
