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
  Dialog,
  TextField
} from '@radix-ui/themes';
import { useRouter, useParams } from 'next/navigation';
import { PageHeading } from '@/components/common/PageHeading';
import { usePageTitle } from '@/hooks/usePageTitle';
import { ArrowLeft, FileText, Download, Printer, Search } from 'lucide-react';
import { getPatientHistoriesByPatientId } from '@/utilities/api/patientHistories';

import { toast } from 'sonner';
import Pagination from '@/components/common/Pagination';

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
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  
  // Pagination and search states
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const tableRef = React.useRef<HTMLDivElement>(null);
  const [isPaginating, setIsPaginating] = useState(false);

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

  // Cleanup PDF preview URL when modal closes
  useEffect(() => {
    if (!isPdfPreviewOpen && pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  }, [isPdfPreviewOpen, pdfPreviewUrl]);

  const handleViewPdf = async (historyRecord: PatientHistoryRecord) => {
    setIsGeneratingPdf(true);
    try {
      const data: HistoryData = JSON.parse(historyRecord.json_data);
      setSelectedHistoryData(data);
      setSelectedHistoryCreatedAt(historyRecord.created_at);
      
      // Generate PDF preview using shared utility
      const { buildPrescriptionPdf } = await import('@/utilities/pdf');
      const { doc } = await buildPrescriptionPdf(data, historyRecord.created_at);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
      
      setIsPdfPreviewOpen(true);
    } catch (e) {
      console.error('Failed to parse history data:', e);
      toast.error('Failed to load history details.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  // Removed buildPdf - now using shared utility from @/utilities/pdf
  const buildPdf_OLD = async (data: HistoryData, recordCreatedAt: string) => {
    const { jsPDF } = await import('jspdf');
    const autoTable = (await import('jspdf-autotable')).default;

    // Support both data formats
    const patientInfo = data.patient || data.patient_info;
    const prescriptions = data.prescriptions || data.prescription || [];
    const totalAmount = data.totalAmount ?? data.total ?? 0;

    const pdfData = {
      patient: patientInfo,
      prescriptions: prescriptions,
      totalAmount: totalAmount
    };

    const doc = new jsPDF({
      unit: "mm",
      format: "a4"
    });

    /* ----------------------------------------------------------
       LOAD KHMER FONT (still needed for names, districts, etc.)
    ----------------------------------------------------------- */
    let fontLoaded = false;
    let khmerFontName = "helvetica";

    console.log('🔤 Attempting to load Khmer fonts for PDF...');

    try {
      console.log('📥 Trying to load NotoSansKhmer-Regular.ttf...');
      const fontResponse = await fetch("/fonts/NotoSansKhmer-Regular.ttf");

      if (fontResponse.ok) {
        const fontArrayBuffer = await fontResponse.arrayBuffer();
        const uint8Array = new Uint8Array(fontArrayBuffer);
        let binaryString = "";
        uint8Array.forEach((byte) => (binaryString += String.fromCharCode(byte)));
        const base64Font = btoa(binaryString);

        doc.addFileToVFS("NotoSansKhmer-Regular.ttf", base64Font);
        doc.addFont("NotoSansKhmer-Regular.ttf", "NotoSansKhmer", "normal");
        doc.setFont("NotoSansKhmer");
        khmerFontName = "NotoSansKhmer";
        fontLoaded = true;
        console.log('✅ NotoSansKhmer font loaded successfully!');
      } else {
        console.warn('⚠️ NotoSansKhmer-Regular.ttf not found (status:', fontResponse.status, ')');
      }
    } catch (error) {
      console.warn('⚠️ Failed to load NotoSansKhmer-Regular.ttf:', error);
    }

    if (!fontLoaded) {
      try {
        console.log('📥 Trying to load KhmerOS.ttf as fallback...');
        const fontResponse = await fetch("/fonts/KhmerOS.ttf");

        if (fontResponse.ok) {
          const fontArrayBuffer = await fontResponse.arrayBuffer();
          const uint8Array = new Uint8Array(fontArrayBuffer);
          let binaryString = "";
          uint8Array.forEach((byte) => (binaryString += String.fromCharCode(byte)));
          const base64Font = btoa(binaryString);

          doc.addFileToVFS("KhmerOS.ttf", base64Font);
          doc.addFont("KhmerOS.ttf", "KhmerOS", "normal");
          doc.setFont("KhmerOS");
          khmerFontName = "KhmerOS";
          fontLoaded = true;
          console.log('✅ KhmerOS font loaded successfully!');
        } else {
          console.warn('⚠️ KhmerOS.ttf not found (status:', fontResponse.status, ')');
        }
      } catch (error) {
        console.warn('⚠️ Failed to load KhmerOS.ttf:', error);
      }
    }

    if (!fontLoaded) {
      console.error('❌ No Khmer fonts found! Using Helvetica fallback.');
      console.error('📖 Please download Khmer fonts. See: KHMER_FONT_SETUP.md');
      console.error('📥 Quick download: https://github.com/notofonts/khmer/raw/main/fonts/NotoSansKhmer/full/ttf/NotoSansKhmer-Regular.ttf');
      doc.setFont("helvetica", "normal");
    }

    /* ----------------------------------------------------------
       BASE SETTINGS
    ----------------------------------------------------------- */
    const now = new Date(recordCreatedAt);
    const dateStr = `${String(now.getDate()).padStart(2, "0")}/${String(
      now.getMonth() + 1
    ).padStart(2, "0")}/${now.getFullYear()}`;

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;

    /* ----------------------------------------------------------
       HEADER (Correct drawing order for cross)
    ----------------------------------------------------------- */

    // Blue block
    doc.setFillColor(11, 59, 145);
    doc.rect(15, 10, 35, 16, "F");

    // Red block (draw BEFORE the cross!)
    doc.setFillColor(210, 0, 0);
    doc.rect(50, 10, 15, 16, "F");

    // White cross (now visible on red box)
    doc.setFillColor(255, 255, 255);

    // vertical bar
    doc.rect(57, 13, 4, 10, "F");

    // horizontal bar
    doc.rect(54, 17, 10, 4, "F");

    // Blue text "SOKLEAN"
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("SOKLEAN", 33, 20, { align: "center" });

    // Center header text
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.text("SOKLEAN", pageWidth / 2 + 10, 15, { align: "center" });

    doc.setFontSize(10);
    doc.text("CABINET MEDICAL", pageWidth / 2 + 10, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text("HEALTH & MEDICAL CLINIC", pageWidth / 2 + 10, 25, { align: "center" });

    // Underline
    doc.setLineWidth(0.4);
    doc.line(pageWidth / 2 - 25, 27, pageWidth / 2 + 25, 27);

    // Title
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Prescription", pageWidth / 2, 37, { align: "center" });
    doc.line(pageWidth / 2 - 20, 38, pageWidth / 2 + 20, 38);

    // Back to Khmer font for content
    doc.setFont(khmerFontName);

    /* ----------------------------------------------------------
       PATIENT INFO (English labels)
    ----------------------------------------------------------- */
    let y = 50;

    doc.setFontSize(12);
    doc.text("Patient:", margin, y);
    doc.text(pdfData.patient?.name || "N/A", margin + 25, y);

    doc.text("Gender:", pageWidth - 80, y);
    doc.text(pdfData.patient?.gender || "N/A", pageWidth - 58, y);

    y += 7;
    doc.text("Age:", margin, y);
    doc.text(String(pdfData.patient?.age || "N/A"), margin + 20, y);

    doc.text("District:", pageWidth - 80, y);
    doc.text(pdfData.patient?.address || "N/A", pageWidth - 58, y);

    y += 7;
    doc.text(`Vital Signs:  ${pdfData.patient?.signs_of_life || "N/A"}`, margin, y);

    y += 7;
    doc.text(`Symptoms: ${pdfData.patient?.symptom || "N/A"}`, margin, y);

    y += 7;
    doc.text(`Diagnosis: ${pdfData.patient?.diagnosis || "N/A"}`, margin, y);

    y += 5;
    doc.line(margin, y, pageWidth - margin, y);

    /* ----------------------------------------------------------
       TABLE (English headers, same layout)
    ----------------------------------------------------------- */
    y += 5;

    const head = [
      ["No.", "Medication", "Morning", "Afternoon", "Evening", "Night", "Period", "QTY", "After Meal", "Before Meal", "Price"]
    ];

    const body = (pdfData.prescriptions || []).map((p: any, i: number) => [
      i + 1,
      p.name,
      p.morning || "",
      p.afternoon || "",
      p.evening || "",
      p.night || "",
      p.period || "",
      p.qty || "",
      p.afterMeal ? "Yes" : "No",
      p.beforeMeal ? "Yes" : "No",
      p.price ? `$${p.price.toFixed(2)}` : ""
    ]);

    while (body.length < 10) body.push(["", "", "", "", "", "", "", "", "", "", ""]);

    autoTable(doc, {
      startY: y,
      head: head,
      body: body,
      tableWidth: doc.internal.pageSize.getWidth() - (margin * 2),
      styles: {
        font: khmerFontName,
        fontSize: 10,
        cellPadding: 2,
        lineWidth: 0.3,
        lineColor: [0, 0, 0]
      },
      headStyles: {
        fillColor: [255, 255, 255],
        textColor: [0, 0, 0],
        halign: "center",
        fontStyle: "bold"
      },
      columnStyles: {
        0: { halign: "center" },
        1: {},
        2: { halign: "center" },
        3: { halign: "center" },
        4: { halign: "center" },
        5: { halign: "center" },
        6: { halign: "center" },
        7: { halign: "center" },
        8: { halign: "center" },
        9: { halign: "center" },
        10: { halign: "right" }
      }
    });

    // Calculate and display grand total
    const grandTotal = (pdfData.prescriptions || []).reduce((sum: number, p: any) => {
      return sum + ((p.price || 0) * (p.qty || 0));
    }, 0);

    let afterTable = doc.lastAutoTable.finalY + 8;

    // Draw a box around the total amount for emphasis
    const boxX = pageWidth - 95;
    const boxY = afterTable - 5;
    const boxWidth = 80;
    const boxHeight = 12;

    doc.setFillColor(240, 240, 240); // Light gray background
    doc.rect(boxX, boxY, boxWidth, boxHeight, "F");
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.5);
    doc.rect(boxX, boxY, boxWidth, boxHeight, "S");

    // Add total amount text
    doc.setFontSize(14);
    doc.setFont(khmerFontName, "bold");
    doc.text("Total Amount:", boxX + 3, afterTable + 2);
    doc.text(`$${grandTotal.toFixed(2)}`, pageWidth - margin - 3, afterTable + 2, { align: "right" });
    doc.setFont(khmerFontName, "normal");

    afterTable = afterTable + 15;

    doc.setFontSize(10);
    doc.text("Note: Please follow your doctor's instructions.", margin, afterTable);

    /* ----------------------------------------------------------
       FOOTER (English)
    ----------------------------------------------------------- */
    const footerY = doc.internal.pageSize.height - 20;

    doc.text(
      "No. St. 7  PHUM KREK TBONG, KHOM KREK, PONHEA KREK, CAMBODIA.",
      margin,
      footerY
    );
    doc.text(`DATE: ${dateStr}`, pageWidth - 60, footerY);

    doc.text("TEL: 010511178", margin, footerY + 6);
    doc.text("Dr. IM SOKLEAN", pageWidth - 60, footerY + 6);

    /* ----------------------------------------------------------
       FINISH
    ----------------------------------------------------------- */
    const fileName = `prescription-${(patientInfo?.name || 'patient').replace(/\s/g, '_')}-${dateStr.replace(/\//g, "")}.pdf`;

    return { doc, fileName };
  };

  const downloadPdf = async () => {
    if (!selectedHistoryData || !selectedHistoryCreatedAt) return;
    try {
      const { buildPrescriptionPdf } = await import('@/utilities/pdf');
      const { doc, fileName } = await buildPrescriptionPdf(selectedHistoryData, selectedHistoryCreatedAt);
      doc.save(fileName);
      toast.success('Prescription PDF downloaded');
    } catch (e) {
      console.error(e);
      toast.error('Failed to download PDF');
    }
  };

  const printPdf = async () => {
    if (!pdfPreviewUrl) return;
    try {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfPreviewUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
      };
    } catch (e) {
      console.error(e);
      toast.error('Failed to print PDF');
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

      {/* Search */}
      <Box mb="4">
        <TextField.Root
          placeholder="Search by patient name, ID, or date..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1); // Reset to first page on search
          }}
        >
          <TextField.Slot>
            <Search size={16} />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      <Card ref={tableRef} style={{ position: 'relative', minHeight: isPaginating ? '400px' : 'auto' }}>
        {isPaginating && (
          <Box style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            borderRadius: '8px'
          }}>
            <Flex direction="column" align="center" gap="2">
              <Box className="animate-spin" style={{
                width: '32px',
                height: '32px',
                border: '3px solid var(--gray-6)',
                borderTopColor: 'var(--blue-9)',
                borderRadius: '50%'
              }} />
              <Text size="2" color="gray">Loading...</Text>
            </Flex>
          </Box>
        )}
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
            {(() => {
              // Filter histories based on search term
              const filteredHistories = histories.filter((history) => {
                const data: HistoryData = JSON.parse(history.json_data);
                const patientInfo = data.patient || data.patient_info;
                const searchLower = searchTerm.toLowerCase();
                
                return (
                  String(history.id).toLowerCase().includes(searchLower) ||
                  history.type.toLowerCase().includes(searchLower) ||
                  (patientInfo?.name || '').toLowerCase().includes(searchLower) ||
                  new Date(history.created_at).toLocaleDateString().includes(searchLower)
                );
              });

              // Calculate pagination
              const totalItems = filteredHistories.length;
              const totalPages = Math.ceil(totalItems / itemsPerPage);
              const startIndex = (currentPage - 1) * itemsPerPage;
              const endIndex = startIndex + itemsPerPage;
              const paginatedHistories = filteredHistories.slice(startIndex, endIndex);

              if (paginatedHistories.length === 0) {
                return (
                  <Table.Row>
                    <Table.Cell colSpan={6}>
                      <Text align="center" className="py-4 text-slate-500">
                        {searchTerm ? 'No matching records found.' : 'No history records found for this patient.'}
                      </Text>
                    </Table.Cell>
                  </Table.Row>
                );
              }

              return paginatedHistories.map((history) => {
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
                            disabled={isGeneratingPdf}
                          >
                            {isGeneratingPdf ? (
                              <Box className="animate-spin" style={{ width: '14px', height: '14px' }}>
                                ⟳
                              </Box>
                            ) : (
                              <FileText size={14} />
                            )}
                          </IconButton>
                        </Tooltip>
                      </Flex>
                    </Table.Cell>
                  </Table.Row>
                );
              });
            })()}
          </Table.Body>
        </Table.Root>

        {/* Pagination */}
        {(() => {
          const filteredHistories = histories.filter((history) => {
            const data: HistoryData = JSON.parse(history.json_data);
            const patientInfo = data.patient || data.patient_info;
            const searchLower = searchTerm.toLowerCase();
            
            return (
              String(history.id).toLowerCase().includes(searchLower) ||
              history.type.toLowerCase().includes(searchLower) ||
              (patientInfo?.name || '').toLowerCase().includes(searchLower) ||
              new Date(history.created_at).toLocaleDateString().includes(searchLower)
            );
          });

          const totalItems = filteredHistories.length;
          const totalPages = Math.ceil(totalItems / itemsPerPage);
          const startIndex = (currentPage - 1) * itemsPerPage;
          const endIndex = Math.min(startIndex + itemsPerPage, totalItems);

          if (totalItems === 0) return null;

          return (
            <Box mt="4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={totalItems}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={(page) => {
                  setIsPaginating(true);
                  setCurrentPage(page);
                  // Smooth scroll to table top with offset
                  setTimeout(() => {
                    if (tableRef.current) {
                      const yOffset = -20; // 20px offset from top
                      const y = tableRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                    // Hide loading after a short delay to show smooth transition
                    setTimeout(() => setIsPaginating(false), 300);
                  }, 0);
                }}
                onItemsPerPageChange={(newSize) => {
                  setIsPaginating(true);
                  setItemsPerPage(newSize);
                  setCurrentPage(1);
                  // Smooth scroll to table top with offset
                  setTimeout(() => {
                    if (tableRef.current) {
                      const yOffset = -20; // 20px offset from top
                      const y = tableRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                    // Hide loading after a short delay to show smooth transition
                    setTimeout(() => setIsPaginating(false), 300);
                  }, 0);
                }}
              />
            </Box>
          );
        })()}
      </Card>

      {/* PDF Preview Modal */}
      <Dialog.Root open={isPdfPreviewOpen} onOpenChange={setIsPdfPreviewOpen}>
        <Dialog.Content style={{ maxWidth: '90vw', maxHeight: '90vh', padding: 0 }}>
          <Flex direction="column" style={{ height: '90vh' }}>
            <Flex justify="between" align="center" p="4" style={{ borderBottom: '1px solid var(--gray-6)' }}>
              <Dialog.Title>View Prescription PDF</Dialog.Title>
              <Flex gap="2">
                <Button size="2" variant="soft" color="gray" onClick={() => setIsPdfPreviewOpen(false)}>
                  Cancel
                </Button>
                <Button size="2" variant="soft" onClick={downloadPdf}>
                  <Download size={16} />
                  Download
                </Button>
                <Button size="2" variant="soft" onClick={printPdf}>
                  <Printer size={16} />
                  Print
                </Button>
              </Flex>
            </Flex>
            <Box style={{ flex: 1, position: 'relative' }}>
              {isGeneratingPdf ? (
                <Flex justify="center" align="center" style={{ height: '100%' }}>
                  <Flex direction="column" align="center" gap="3">
                    <Box className="animate-spin" style={{
                      width: '48px',
                      height: '48px',
                      border: '4px solid var(--gray-6)',
                      borderTopColor: 'var(--blue-9)',
                      borderRadius: '50%'
                    }} />
                    <Text>Generating PDF...</Text>
                  </Flex>
                </Flex>
              ) : pdfPreviewUrl ? (
                <iframe
                  src={pdfPreviewUrl}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  title="PDF Preview"
                />
              ) : null}
            </Box>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}
