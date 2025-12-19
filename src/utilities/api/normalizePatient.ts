export type RawPatientInput = {
  name: string;
  gender?: string | null;
  age?: string | number | null;
  telephone?: string | null;
  address?: string | null;
  signs_of_life?: string | null;
  pe?: string | null;
  symptom?: string | null;
  diagnosis?: string | null;
};

export function normalizePatientPayload(input: RawPatientInput) {
  const trimOrNull = (v?: string | number | null) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s.length ? s : null;
  };

  return {
    name: String(input.name || '').trim(),
    gender: trimOrNull(input.gender ?? null),
    age: trimOrNull(input.age),
    telephone: trimOrNull(input.telephone ?? null),
    address: trimOrNull(input.address ?? null),
    signs_of_life: trimOrNull(input.signs_of_life ?? null),
    pe: trimOrNull(input.pe ?? null),
    symptom: trimOrNull(input.symptom ?? null),
    diagnosis: trimOrNull(input.diagnosis ?? null),
  };
}
