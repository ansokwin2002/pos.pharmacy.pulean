import { API_BASE } from '@/utilities/constants';

export type PatientHistoryPayload = {
  type: string;
  json_data: string; // JSON string
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

export async function listPatientHistories(patientId: string) {
  const res = await fetch(`${API_BASE}/patient-histories?patient_id=${patientId}`, {
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
