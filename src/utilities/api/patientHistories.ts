import { API_BASE } from '@/utilities/constants';

export type PatientHistoryPayload = {
  type: string;
  json_data: string; // JSON string
  patient_id?: string | number; // Optional patient ID for filtering
};

export async function createPatientHistory(payload: PatientHistoryPayload) {
  const res = await fetch(`${API_BASE}/patient-histories`, {
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

export async function listPatientHistories(patientId?: string) {
  const url = patientId 
    ? `${API_BASE}/patient-histories?patient_id=${patientId}`
    : `${API_BASE}/patient-histories`;
  const res = await fetch(url, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function listAllPatientHistories() {
  const res = await fetch(`${API_BASE}/patient-histories`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) throw await toError(res);
  return res.json();
}

export async function getPatientHistoriesByPatientId(patientId: string) {
  const res = await fetch(`${API_BASE}/patient-histories/patient/${patientId}`, {
    headers: { Accept: 'application/json' },
  });
  if (!res.ok) {
    if (res.status === 404) {
      // No histories found - return empty array instead of throwing
      return [];
    }
    throw await toError(res);
  }
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
