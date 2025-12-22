'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Box, Flex, Table, TextField, Text, Card, Badge } from "@radix-ui/themes";
import { PageHeading } from '@/components/common/PageHeading';
import { Search, FileText, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import Pagination from '@/components/common/Pagination';
import { listPatientHistories, getPatientHistoriesByPatientId } from '@/utilities/api/patientHistories';

interface PatientHistory {
  id: string;
  type: string;
  json_data: string;
  created_at?: string;
  updated_at?: string;
}

interface HistoryData {
  patient: {
    name: string;
    gender: string;
    age: number;
    telephone: string;
    address: string;
    signs_of_life: string;
    symptom: string;
    diagnosis: string;
  };
  prescriptions: Array<{
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
    total: number;
  }>;
  totalAmount: number;
  createdAt: string;
}

export default function OPDHistoryPage() {
  const searchParams = useSearchParams();
  const patientId = searchParams.get('patient_id');
  
  const [histories, setHistories] = useState<PatientHistory[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<PatientHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedHistory, setSelectedHistory] = useState<HistoryData | null>(null);
  const [isPdfDialogOpen, setIsPdfDialogOpen] = useState(false);

  // Fetch histories from API
  useEffect(() => {
    const fetchHistories = async () => {
      try {
        setIsLoading(true);
        let data;
        
        if (patientId) {
          // Use new backend endpoint that filters by patient ID using JSON extraction
          console.log('Fetching histories for patient ID:', patientId);
          data = await getPatientHistoriesByPatientId(patientId);
          console.log('Fetched patient histories:', data?.length || 0);
        } else {
          // Fetch all histories
          data = await listPatientHistories();
          console.log('Fetched all histories:', data?.length || 0);
        }
        
        // Filter only OPD type histories (backend already filtered by patient ID if provided)
        const opdHistories = Array.isArray(data) ? data.filter((h: PatientHistory) => h.type === 'opd') : [];
        console.log('OPD histories:', opdHistories.length);
        
        setHistories(opdHistories);
        setFilteredHistories(opdHistories);
      } catch (error) {
        console.error('Error fetching histories:', error);
        toast.error('Failed to load OPD histories');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistories();
  }, [patientId]);

  // Filter histories based on search
  useEffect(() => {
    if (!searchTerm) {
      setFilteredHistories(histories);
      return;
    }

    const lowercased = searchTerm.toLowerCase();
    const filtered = histories.filter(history => {
      try {
        const data: HistoryData = JSON.parse(history.json_data);
        return (
          data.patient.name.toLowerCase().includes(lowercased) ||
          data.patient.telephone.toLowerCase().includes(lowercased) ||
          data.patient.diagnosis.toLowerCase().includes(lowercased)
        );
      } catch {
        return false;
      }
    });
    setFilteredHistories(filtered);
    setCurrentPage(1);
  }, [searchTerm, histories]);

  // Handle row click - generate and show PDF
  const handleRowClick = async (history: PatientHistory) => {
    try {
      const data: HistoryData = JSON.parse(history.json_data);
      setSelectedHistory(data);
      
      // Generate PDF and open in new window
      await generateAndShowPDF(data);
    } catch (error) {
      console.error('Error showing PDF:', error);
      toast.error('Failed to generate PDF');
    }
  };

  // Generate PDF (same as export PDF in register page)
  const generateAndShowPDF = async (data: HistoryData) => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    const doc = new jsPDF();
    doc.setFont('helvetica', 'normal');

    const now = new Date(data.createdAt);
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('PUNLEUKREK PHARMACY', pageWidth / 2, 25, { align: 'center' });

    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('PRESCRIPTION', pageWidth / 2, 35, { align: 'center' });

    // Date
    const dateStr = `${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
    doc.setFontSize(10);
    doc.text(`Date: ${dateStr}`, pageWidth - margin, 45, { align: 'right' });

    // Line separator
    doc.setLineWidth(0.5);
    doc.line(margin, 50, pageWidth - margin, 50);

    // Patient information
    let y = 65;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT:', margin, y);

    y += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.patient.name}, ${data.patient.gender}, Age ${data.patient.age}`, margin, y);

    y += 8;
    doc.text(`Phone: ${data.patient.telephone}`, margin, y);

    y += 8;
    doc.text(`Address: ${data.patient.address}`, margin, y);

    if (data.patient.symptom || data.patient.diagnosis) {
      y += 8;
      doc.text(`Condition: ${data.patient.symptom} ${data.patient.diagnosis ? '(' + data.patient.diagnosis + ')' : ''}`, margin, y);
    }

    // Prescription section
    y += 20;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('MEDICATIONS:', margin, y);

    y += 10;

    // Table
    const head = [['Medication', 'Dosage', 'Duration', 'Qty', 'Price']];
    const body = data.prescriptions.map((p) => {
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
        `$${p.total.toFixed(2)}`,
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

    // Total
    const afterTableY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 15 : y + 15;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(`TOTAL: $${data.totalAmount.toFixed(2)}`, pageWidth - margin, afterTableY, { align: 'right' });

    // Instructions
    const instructionsY = afterTableY + 20;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Instructions: Take as directed by pharmacist', margin, instructionsY);

    // Footer
    const footerY = pageHeight - 30;
    doc.setFontSize(10);
    doc.text('Patient Signature: ________________________', margin, footerY);
    doc.text('Dr. IM SOKLEAN - Tel: 0975111789', pageWidth - margin, footerY, { align: 'right' });

    // Open PDF in new window
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const win = window.open(url);
    if (!win) {
      toast.error('Popup blocked. Allow popups to view PDF.');
      return;
    }
    
    toast.success('PDF opened in new window');
  };

  // Pagination
  const totalPages = Math.ceil(filteredHistories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredHistories.length);
  const currentItems = filteredHistories.slice(startIndex, endIndex);

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'N/A';
    }
  };

  return (
    <Box className="space-y-4 w-full px-4">
      <Flex justify="between" align="start" mb="5" className="w-full">
        <PageHeading 
          title={patientId ? `OPD History - Patient ${patientId}` : "OPD History"}
          description={patientId ? "View OPD visit records for this patient" : "View all OPD patient visit records and prescriptions"}
        />
      </Flex>

      {/* Search */}
      <Box className="w-full">
        <Flex gap="4" align="center" wrap="wrap" className="w-full">
          <Box className="flex-grow min-w-[250px]">
            <TextField.Root
              placeholder="Search by patient name, phone, or diagnosis..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            >
              <TextField.Slot>
                <Search size={16} />
              </TextField.Slot>
            </TextField.Root>
          </Box>
        </Flex>
      </Box>

      {/* History Table */}
      <Card>
        <Table.Root variant="surface" style={{ width: '100%' }}>
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Patient Name</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Age/Gender</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Phone</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Diagnosis</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Medications</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Total Amount</Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {isLoading ? (
              <Table.Row>
                <Table.Cell colSpan={7} className="text-center">
                  <Text size="3" color="gray">Loading histories...</Text>
                </Table.Cell>
              </Table.Row>
            ) : currentItems.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={7} className="text-center">
                  <Text size="3" color="gray">No OPD histories found.</Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              currentItems.map((history) => {
                try {
                  const data: HistoryData = JSON.parse(history.json_data);
                  return (
                    <Table.Row 
                      key={history.id}
                      onClick={() => handleRowClick(history)}
                      style={{ cursor: 'pointer' }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Table.Cell>
                        <Flex align="center" gap="2">
                          <Calendar size={14} />
                          <Text size="2">{formatDate(data.createdAt)}</Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Flex align="center" gap="2">
                          <User size={14} />
                          <Text weight="bold">{data.patient.name}</Text>
                        </Flex>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{data.patient.age} / {data.patient.gender}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{data.patient.telephone}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="2">{data.patient.diagnosis || '-'}</Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Badge color="blue">{data.prescriptions.length} items</Badge>
                      </Table.Cell>
                      <Table.Cell>
                        <Text weight="bold" size="2">${data.totalAmount.toFixed(2)}</Text>
                      </Table.Cell>
                    </Table.Row>
                  );
                } catch (error) {
                  console.error('Error parsing history data:', error);
                  return null;
                }
              })
            )}
          </Table.Body>
        </Table.Root>
      </Card>

      {/* Pagination */}
      {filteredHistories.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredHistories.length}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          }}
        />
      )}

      {/* Info Card */}
      <Card>
        <Flex align="center" gap="2" p="3">
          <FileText size={16} />
          <Text size="2" color="gray">
            Click on any row to view and print the prescription PDF
          </Text>
        </Flex>
      </Card>
    </Box>
  );
}
