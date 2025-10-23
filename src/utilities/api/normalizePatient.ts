export type RawPatientInput = {
  name: string;
  gender?: string | null;
  age?: string | number | null;
  telephone?: string | null;
  address?: string | null;
  signs_of_life?: string | null;
  symptom?: string | null;
  diagnosis?: string | null;
};

export function normalizePatientPayload(input: RawPatientInput) {
  const trimOrNull = (v?: string | null) => {
    if (v === undefined || v === null) return null;
    const s = String(v).trim();
    return s.length ? s : null;
  };

  const ageNum = typeof input.age === 'string' ? Number(input.age) : input.age;
  const ageValid = typeof ageNum === 'number' && Number.isFinite(ageNum) && ageNum >= 0 && ageNum <= 150;

  return {
    name: String(input.name || '').trim(),
    gender: trimOrNull(input.gender ?? null),
    age: ageValid ? ageNum : null,
    telephone: trimOrNull(input.telephone ?? null),
    address: trimOrNull(input.address ?? null),
    signs_of_life: trimOrNull(input.signs_of_life ?? null),
    symptom: trimOrNull(input.symptom ?? null),
    diagnosis: trimOrNull(input.diagnosis ?? null),
  };
}
