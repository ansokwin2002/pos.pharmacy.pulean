'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Flex,
  Table,
  Text,
  Tooltip,
  IconButton,
  Dialog
} from '@radix-ui/themes';
import { useRouter, useParams } from 'next/navigation';
import { PageHeading } from '@/components/common/PageHeading';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ArrowLeft, FileText, Download } from 'lucide-react';
import { getPatientHistoriesByPatientId } from '@/utilities/api/patientHistories';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface PatientHistoryRecord {
  id: string;
  type: string;
  json_data: string; // This will be a JSON string
  created_at: string;
}

interface PatientInfo {
  name: string;
  gender: string;
  age: number;
  telephone: string;
  address: string;
  signs_of_life: string;
  symptom: string;
  diagnosis: string;
}

interface PrescriptionDrug {
  id: string;
  name: string;
  price: number;
  morning: number;
  afternoon: number;
  evening: number;
  night: number;
  period: string;
  qty: number;
  afterMeal: boolean;
  beforeMeal: boolean;
}

interface HistoryData {
  // Support both old and new formats
  patient_info?: PatientInfo;
  patient?: PatientInfo;
  prescription?: PrescriptionDrug[];
  prescriptions?: PrescriptionDrug[];
  total?: number;
  totalAmount?: number;
}

export default function PatientHistoryPage() {
  const router = useRouter();
  const params = useParams();
  const patientId = params.id as string;

  const [histories, setHistories] = useState<PatientHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHistoryData, setSelectedHistoryData] = useState<HistoryData | null>(null);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [selectedHistoryCreatedAt, setSelectedHistoryCreatedAt] = useState<string | null>(null);

  usePageTitle(patientId ? `History for Patient ${patientId}` : 'Patient History');

  useEffect(() => {
    if (!patientId) return;

    const fetchHistories = async () => {
      setIsLoading(true);
      try {
        // Use new backend endpoint that filters by patient ID using JSON extraction
        const response = await getPatientHistoriesByPatientId(patientId);
        console.log('Fetched patient histories for ID', patientId, ':', response?.length || 0);
        
        // Filter by OPD type (backend already filtered by patient ID)
        const opdHistories = Array.isArray(response) ? response.filter((h: PatientHistoryRecord) => h.type === 'opd') : [];
        console.log('OPD histories count:', opdHistories.length);
        
        setHistories(opdHistories);
      } catch (err: any) {
        console.error('Failed to fetch patient histories:', err);
        setError(err.message || 'Failed to fetch histories');
        toast.error(err.detail?.message || err.message || 'Failed to fetch histories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistories();
  }, [patientId]);

  const handleViewPdf = async (historyRecord: PatientHistoryRecord) => {
    try {
      const data: HistoryData = JSON.parse(historyRecord.json_data);
      setSelectedHistoryData(data);
      setSelectedHistoryCreatedAt(historyRecord.created_at);
      setIsPdfPreviewOpen(true);
    } catch (e) {
      console.error('Failed to parse history data:', e);
      toast.error('Failed to load history details.');
    }
  };

  const buildPdf = async (data: HistoryData, recordCreatedAt: string) => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');

    // Support both data formats
    const patientInfo = data.patient || data.patient_info;
    const prescriptions = data.prescriptions || data.prescription || [];
    const totalAmount = data.totalAmount ?? data.total ?? 0;

    const now = new Date(recordCreatedAt || Date.now()); // Use history created_at or current time
    const fileName = `prescription-${(patientInfo?.name || 'patient').replace(/\s/g, '_')}-${format(now, 'yyyyMMdd')}.pdf`;

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('PUNLEUKREK PHARMACY', pageWidth / 2, 25, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('PRESCRIPTION', pageWidth / 2, 35, { align: 'center' });

    const dateStr = format(now, 'dd/MM/yyyy');
    doc.setFontSize(10);
    doc.text(`Date: ${dateStr}`, pageWidth - margin, 45, { align: 'right' });

    doc.setLineWidth(0.5);
    doc.line(margin, 50, pageWidth - margin, 50);

    let y = 65;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT:', margin, y);

    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${patientInfo?.name || 'N/A'}, ${patientInfo?.gender || 'N/A'}, Age ${patientInfo?.age || 'N/A'}`, margin, y);

    y += 8;
    doc.text(`Phone: ${patientInfo?.telephone || 'N/A'}`, margin, y);

    y += 8;
    doc.text(`Address: ${patientInfo?.address || 'N/A'}`, margin, y);

    if (patientInfo?.symptom || patientInfo?.diagnosis) {
      y += 8;
      doc.text(`Condition: ${patientInfo.symptom || ''} ${patientInfo.diagnosis ? '(' + patientInfo.diagnosis + ')' : ''}`, margin, y);
    }

    y += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICATIONS:', margin, y);

    y += 10;

    const head = [['Medication', 'Dosage', 'Duration', 'Qty', 'Price']];
    const body = prescriptions.map((p) => {
      const dosage = [];
      if (p.morning) dosage.push(`${p.morning} morning`);
      if (p.afternoon) dosage.push(`${p.afternoon} afternoon`);
      if (p.evening) dosage.push(`${p.evening} evening`);
      if (p.night) dosage.push(`${p.night} night`);

      let dosageStr = dosage.join(', ') || 'As directed';

      if (p.beforeMeal) dosageStr += ' (before meal)';
      if (p.afterMeal) dosageStr += ' (after meal)';

      return [
        p.name,
        dosageStr,
        p.period ? `${p.period} days` : '-',
        p.qty || '-',
        `$${(p.price * p.qty).toFixed(2)}`,
      ];
    });

    // @ts-ignore
    autoTable(doc, {
      head,
      body,
      startY: y,
      margin: { left: margin, right: margin },
      styles: {
        font: 'helvetica',
        fontSize: 10,
        cellPadding: 5,
        lineColor: [200, 200, 200],
        lineWidth: 0.5,
      },
      headStyles: {
        fillColor: [240, 240, 240],
        textColor: [0, 0, 0],
        fontStyle: 'bold',
      },
      columnStyles: {
        0: { cellWidth: 60, halign: 'left' },
        1: { cellWidth: 50, halign: 'left' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 20, halign: 'center' },
        4: { cellWidth: 25, halign: 'right' },
      },
      theme: 'grid',
    });

    const afterTableY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : y + 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`TOTAL: ${totalAmount.toFixed(2)}`, pageWidth - margin, afterTableY, { align: 'right' });

    const instructionsY = afterTableY + 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Instructions: Take as directed by pharmacist', margin, instructionsY);

    const footerY = pageHeight - 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Patient Signature: ________________________', margin, footerY);
    doc.text('Dr. IM SOKLEAN - Tel: 0975111789', pageWidth - margin, footerY, { align: 'right' });

    return { doc, fileName };
  };

  const downloadPdf = async () => {
    if (!selectedHistoryData || !selectedHistoryCreatedAt) return;
    try {
      const { doc, fileName } = await buildPdf(selectedHistoryData, selectedHistoryCreatedAt);
      doc.save(fileName);
      toast.success('Prescription PDF downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to download PDF');
    }
  };

  const previewPrintPdf = async () => {
    if (!selectedHistoryData || !selectedHistoryCreatedAt) return;
    try {
      const { doc } = await buildPdf(selectedHistoryData, selectedHistoryCreatedAt);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      const win = window.open(url);
      if (!win) {
        toast.error('Popup blocked. Allow popups to preview/print.');
        return;
      }
      const onLoad = () => {
        win.focus();
        win.print();
      };
      win.addEventListener('load', onLoad);
      setTimeout(() => {
        try { win.focus(); win.print(); } catch {}
      }, 800);
    } catch (e) {
      console.error(e);
      toast.error('Failed to preview/print PDF');
    }
  };

  if (isLoading) {
    return (
      <Box className="space-y-4">
        <Text>Loading patient history...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="space-y-4">
        <Text color="red">Error: {error}</Text>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      <Button variant="ghost" onClick={() => router.push('/opd/patients')} className="mb-8">
        <ArrowLeft size={16} />
        Back to Patient List
      </Button>

      <PageHeading
        title={`Patient History for ${patientId}`}
        description="View and manage past patient records and prescriptions."
      />

      <Card>
        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Patient Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {histories.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6}>
                  <Text align="center" className="py-4 text-slate-500">No history records found for this patient.</Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              histories.map((history) => {
                const data: HistoryData = JSON.parse(history.json_data);
                const patientInfo = data.patient || data.patient_info;
                const totalAmount = data.totalAmount ?? data.total ?? 0;
                return (
                  <Table.Row key={history.id}>
                    <Table.Cell>{history.id}</Table.Cell>
                    <Table.Cell>{history.type}</Table.Cell>
                    <Table.Cell>{patientInfo?.name || 'N/A'}</Table.Cell>
                    <Table.Cell>${totalAmount.toFixed(2)}</Table.Cell>
                    <Table.Cell>{new Date(history.created_at).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>
                      <Flex gap="2">
                        <Tooltip content="View Prescription PDF">
                          <IconButton
                            size="1"
                            variant="ghost"
                            color="blue"
                            onClick={() => handleViewPdf(history)}
                          >
                            <FileText size={14} />
                          </IconButton>
                        </Tooltip>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                );
              })
            )}
          </Table.Body>
        </Table.Root>
      </Card>

      <Dialog.Root open={isPdfPreviewOpen} onOpenChange={setIsPdfPreviewOpen}>
        <Dialog.Content style={{ maxWidth: 700 }}>
          <Dialog.Title>Prescription Preview</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Review the prescription details before downloading or printing.
          </Dialog.Description>
          {selectedHistoryData && (() => {
            const patientInfo = selectedHistoryData.patient || selectedHistoryData.patient_info;
            const prescriptions = selectedHistoryData.prescriptions || selectedHistoryData.prescription || [];
            const totalAmount = selectedHistoryData.totalAmount ?? selectedHistoryData.total ?? 0;
            
            return (
              <Box>
                <Text size="3" weight="bold">Patient: {patientInfo?.name || 'N/A'}</Text><br/>
                <Text size="3" weight="bold">Total: ${totalAmount.toFixed(2)}</Text>
                {/* Add more summary details here if needed */}
                <Table.Root variant="surface" mt="3">
                  <Table.Header>
                    <Table.Row>
                      <Table.ColumnHeaderCell>Medication</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Dosage</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Qty</Table.ColumnHeaderCell>
                      <Table.ColumnHeaderCell>Price</Table.ColumnHeaderCell>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    {Array.isArray(prescriptions) && prescriptions.map((p, idx) => (
                      <Table.Row key={idx}>
                        <Table.Cell>{p.name}</Table.Cell>
                        <Table.Cell>{`${p.morning}-${p.afternoon}-${p.evening}-${p.night}`}</Table.Cell>
                        <Table.Cell>{p.qty}</Table.Cell>
                        <Table.Cell>${p.price.toFixed(2)}</Table.Cell>
                      </Table.Row>
                    ))}
                  </Table.Body>
                </Table.Root>
              </Box>
            );
          })()}
          <Flex gap="3" mt="4" justify="end">
            <Dialog.Close>
              <Button variant="soft" color="gray">Close</Button>
            </Dialog.Close>
            <Button onClick={downloadPdf}>
              <Download size={16} /> Download PDF
            </Button>
            <Button onClick={previewPrintPdf}>
              <FileText size={16} /> Print
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
