import { PatientHistory } from '../app/(default)/opd/all-history/ClientPage';

export const patientHistoryData: PatientHistory[] = [
  {
    id: 'pat-h-001',
    patient_id: 'PAT001',
    patient_name: 'John Doe',
    type: 'opd',
    created_at: new Date('2023-11-15T10:00:00Z').toISOString(),
    json_data: JSON.stringify({
      patient_info: { name: 'John Doe', age: 45, gender: 'Male', address: 'Phnom Penh', signs_of_life: 'Normal', symptom: 'Fever', diagnosis: 'Flu' },
      prescription: [
        { name: 'Paracetamol', morning: '1', afternoon: '1', evening: '1', night: '0', period: '3 days', qty: 9, afterMeal: true, beforeMeal: false, price: 0.50 },
        { name: 'Amoxicillin', morning: '1', afternoon: '0', evening: '1', night: '0', period: '7 days', qty: 14, afterMeal: false, beforeMeal: true, price: 1.20 }
      ],
      totalAmount: 21.30
    })
  },
  {
    id: 'pat-h-002',
    patient_id: 'PAT002',
    patient_name: 'Jane Smith',
    type: 'opd',
    created_at: new Date('2023-11-14T14:30:00Z').toISOString(),
    json_data: JSON.stringify({
      patient_info: { name: 'Jane Smith', age: 30, gender: 'Female', address: 'Kandal', signs_of_life: 'Normal', symptom: 'Headache', diagnosis: 'Migraine' },
      prescription: [
        { name: 'Ibuprofen', morning: '1', afternoon: '0', evening: '1', night: '0', period: '5 days', qty: 10, afterMeal: true, beforeMeal: false, price: 0.75 },
        { name: 'Sumatriptan', morning: '1', afternoon: '0', evening: '0', night: '0', period: '1 day', qty: 1, afterMeal: false, beforeMeal: false, price: 3.00 }
      ],
      totalAmount: 10.50
    })
  },
  {
    id: 'pat-h-003',
    patient_id: 'PAT003',
    patient_name: 'Sok Mean',
    type: 'opd',
    created_at: new Date('2023-11-13T09:00:00Z').toISOString(),
    json_data: JSON.stringify({
      patient_info: { name: 'Sok Mean', age: 60, gender: 'Male', address: 'Siem Reap', signs_of_life: 'Elevated BP', symptom: 'Chest Pain', diagnosis: 'Hypertension' },
      prescription: [
        { name: 'Lisinopril', morning: '1', afternoon: '0', evening: '0', night: '0', period: '30 days', qty: 30, afterMeal: true, beforeMeal: false, price: 0.25 },
        { name: 'Aspirin', morning: '0', afternoon: '0', evening: '1', night: '0', period: '30 days', qty: 30, afterMeal: true, beforeMeal: false, price: 0.10 }
      ],
      totalAmount: 10.50
    })
  },
    {
    id: 'pat-h-004',
    patient_id: 'PAT004',
    patient_name: 'Channary',
    type: 'opd',
    created_at: new Date('2023-11-12T11:00:00Z').toISOString(),
    json_data: JSON.stringify({
      patient_info: { name: 'Channary', age: 25, gender: 'Female', address: 'Battambang', signs_of_life: 'Normal', symptom: 'Cough', diagnosis: 'Common Cold' },
      prescription: [
        { name: 'Dextromethorphan', morning: '1', afternoon: '1', evening: '1', night: '1', period: '5 days', qty: 20, afterMeal: true, beforeMeal: false, price: 0.40 },
        { name: 'Vitamin C', morning: '1', afternoon: '0', evening: '0', night: '0', period: '10 days', qty: 10, afterMeal: true, beforeMeal: false, price: 0.15 }
      ],
      totalAmount: 9.00
    })
  },
  {
    id: 'pat-h-005',
    patient_id: 'PAT005',
    patient_name: 'Dara',
    type: 'opd',
    created_at: new Date('2023-11-11T16:00:00Z').toISOString(),
    json_data: JSON.stringify({
      patient_info: { name: 'Dara', age: 50, gender: 'Male', address: 'Kampong Cham', signs_of_life: 'Normal', symptom: 'Joint Pain', diagnosis: 'Arthritis' },
      prescription: [
        { name: 'Diclofenac', morning: '1', afternoon: '0', evening: '1', night: '0', period: '7 days', qty: 14, afterMeal: true, beforeMeal: false, price: 0.80 },
        { name: 'Glucosamine', morning: '1', afternoon: '0', evening: '0', night: '0', period: '30 days', qty: 30, afterMeal: true, beforeMeal: false, price: 0.30 }
      ],
      totalAmount: 19.20
    })
  }
];
