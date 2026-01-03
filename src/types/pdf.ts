
export interface PrescriptionData {
      patient?: {
        name?: string;
        age?: number | string;
        gender?: string;
        address?: string;
        signs_of_life?: string;
        symptom?: string;
        diagnosis?: string;
        pe?: string; // Added PE field
      };  patient_info?: {
    name?: string;
    age?: number | string;
    gender?: string;
    address?: string;
    signs_of_life?: string;
    symptom?: string;
    diagnosis?: string;
    pe?: string; // Added PE field
  };
  prescriptions?: any[];
  prescription?: any[];
  totalAmount?: number;
  total?: number;
}
