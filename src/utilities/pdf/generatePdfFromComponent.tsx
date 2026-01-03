
import React from 'react';
import { pdf } from '@react-pdf/renderer'; // Import pdf instead of renderToStream
import { PrescriptionDocument } from '@/components/pdf/PrescriptionDocument';
import { PrescriptionData } from '@/types/pdf';

export async function generatePdfFromComponent(data: PrescriptionData, recordCreatedAt: string) {
  // Use pdf().toBlob() for client-side rendering
  const blob = await pdf(<PrescriptionDocument data={data} recordCreatedAt={recordCreatedAt} />).toBlob();
  
  const patientInfo = data.patient || data.patient_info;
  const now = new Date(recordCreatedAt);
  const dateStr = `${String(now.getDate()).padStart(2, '0')}${String(now.getMonth() + 1).padStart(2, '0')}${now.getFullYear()}`;
  const fileName = `prescription-${(patientInfo?.name || 'patient').replace(/\s/g, '_')}-${dateStr}.pdf`;

  return { blob, fileName };
}
