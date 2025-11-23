'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Flex,
  Table,
  Text,
  TextField,
  IconButton,
  Tooltip,
  Dialog
} from '@radix-ui/themes';
import { PageHeading } from '@/components/common/PageHeading';
import { Search, FileText, Download, Printer, X } from 'lucide-react';
import { SortableHeader } from '@/components/common/SortableHeader';
import Pagination from '@/components/common/Pagination';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import DateInput from '@/components/common/DateInput';

interface PatientHistory {
  id: string;
  patient_id: string;
  patient_name: string;
  type: string;
  created_at: string;
  json_data: string;
}

interface HistoryData {
  patient?: any;
  patient_info?: any;
  prescriptions?: any[];
  prescription?: any[];
  totalAmount?: number;
  total?: number;
}

export default function AllHistoryClientPage() {
  const router = useRouter();
  const [histories, setHistories] = useState<PatientHistory[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<PatientHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isPaginating, setIsPaginating] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof PatientHistory; direction: 'asc' | 'desc' } | null>(null);
  const tableRef = React.useRef<HTMLDivElement>(null);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<PatientHistory | null>(null);

  useEffect(() => {
    loadAllHistories();
  }, []);

  const loadAllHistories = async () => {
    setIsPaginating(true);
    try {
      // Import the API function to get all histories
      const { listAllPatientHistories } = await import('@/utilities/api/patientHistories');
      
      // Fetch all history records
      const allHistoriesData = await listAllPatientHistories();
      
      // Parse and format the data
      const formattedHistories = allHistoriesData.map((h: any) => {
        let patientName = 'Unknown';
        
        // Try to extract patient name from json_data
        try {
          const data = JSON.parse(h.json_data);
          const patientInfo = data.patient || data.patient_info;
          if (patientInfo && patientInfo.name) {
            patientName = patientInfo.name;
          }
        } catch (e) {
          console.error('Failed to parse json_data:', e);
        }
        
        return {
          ...h,
          patient_name: patientName,
          patient_id: h.patient_id || 'N/A'
        };
      });
      
      setHistories(formattedHistories);
      setFilteredHistories(formattedHistories);
    } catch (error) {
      console.error('Failed to load patient histories:', error);
      toast.error('Failed to load patient histories');
    } finally {
      setIsPaginating(false);
    }
  };

  useEffect(() => {
    let sorted = [...histories];
    
    // Apply sorting
    if (sortConfig !== null) {
      sorted.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    // Apply search filter
    const lowercasedFilter = searchTerm.toLowerCase();
    let filtered = sorted.filter(history => {
      // Search by patient name
      if (history.patient_name && history.patient_name.toLowerCase().includes(lowercasedFilter)) return true;
      
      // Search by type
      if (history.type && history.type.toLowerCase().includes(lowercasedFilter)) return true;
      
      // Search by ID
      if (history.id && history.id.toLowerCase().includes(lowercasedFilter)) return true;
      
      // Search by date
      if (history.created_at) {
        const createdDate = new Date(history.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        if (createdDate.toLowerCase().includes(lowercasedFilter)) return true;
      }
      
      return false;
    });

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(history => {
        if (!history.created_at) return false;
        
        const historyDate = new Date(history.created_at);
        const filterDate = new Date(dateFilter);
        
        const historyYear = historyDate.getFullYear();
        const historyMonth = historyDate.getMonth();
        const historyDay = historyDate.getDate();
        
        const filterYear = filterDate.getFullYear();
        const filterMonth = filterDate.getMonth();
        const filterDay = filterDate.getDate();
        
        return historyYear === filterYear && 
               historyMonth === filterMonth && 
               historyDay === filterDay;
      });
    }

    setFilteredHistories(filtered);
    setCurrentPage(1);
  }, [searchTerm, dateFilter, sortConfig, histories]);

  const handleSort = (key: keyof PatientHistory) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDateFilter(null);
  };

  const handleViewPdf = async (history: PatientHistory) => {
    setIsGeneratingPdf(true);
    setSelectedHistory(history);
    
    try {
      const data: HistoryData = JSON.parse(history.json_data);
      const { doc } = await buildPdf(data, history.created_at);
      const blob = doc.output('blob');
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
      setIsPdfPreviewOpen(true);
    } catch (e) {
      console.error('Failed to generate PDF:', e);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleDownloadPdf = () => {
    if (pdfPreviewUrl && selectedHistory) {
      const link = document.createElement('a');
      link.href = pdfPreviewUrl;
      link.download = `prescription-${selectedHistory.id}.pdf`;
      link.click();
    }
  };

  const handlePrintPdf = () => {
    if (pdfPreviewUrl) {
      const iframe = document.createElement('iframe');
      iframe.style.display = 'none';
      iframe.src = pdfPreviewUrl;
      document.body.appendChild(iframe);
      iframe.onload = () => {
        iframe.contentWindow?.print();
      };
    }
  };

  const buildPdf = async (data: HistoryData, recordCreatedAt: string) => {
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
      p.price ? `${p.price.toFixed(2)}` : ""
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

    let afterTable = (doc as any).lastAutoTable.finalY + 8;

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
    doc.text(`${grandTotal.toFixed(2)}`, pageWidth - margin - 3, afterTable + 2, { align: "right" });
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

  const getTotalAmount = (jsonData: string): number => {
    try {
      const data: HistoryData = JSON.parse(jsonData);
      return data.totalAmount ?? data.total ?? 0;
    } catch {
      return 0;
    }
  };

  const getPrescriptionCount = (jsonData: string): number => {
    try {
      const data: HistoryData = JSON.parse(jsonData);
      const prescriptions = data.prescriptions || data.prescription || [];
      return prescriptions.length;
    } catch {
      return 0;
    }
  };

  const totalPages = Math.ceil(filteredHistories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredHistories.length);
  const currentItems = filteredHistories.slice(startIndex, endIndex);

  return (
    <Box className="space-y-4 w-full px-4">
      <PageHeading 
        title="All History OPD" 
        description="View all patient prescription histories"
      />

      {/* Filters */}
      <Flex gap="4" align="center" wrap="wrap" className="w-full">
        <Box className="flex-grow min-w-[250px]">
          <TextField.Root
            placeholder="Search by patient name, type, ID, or date..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          >
            <TextField.Slot>
              <Search size={16} />
            </TextField.Slot>
          </TextField.Root>
        </Box>
        <Box className="flex-shrink-0" style={{ minWidth: '150px' }}>
          <DateInput
            value={dateFilter}
            onChange={(date) => setDateFilter(date)}
          />
        </Box>
        <Button 
          variant="soft" 
          color={searchTerm || dateFilter ? 'red' : 'gray'} 
          onClick={handleResetFilters}
        >
          Reset Filters
        </Button>
      </Flex>

      {/* Table */}
      <Box ref={tableRef} style={{ position: 'relative', minHeight: isPaginating ? '400px' : 'auto' }}>
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
            
            <Card>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>
                      <SortableHeader
                        label="Type"
                        sortKey="type"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      />
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      <SortableHeader
                        label="Patient Name"
                        sortKey="patient_name"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      />
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Total</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>
                      <SortableHeader
                        label="Date"
                        sortKey="created_at"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      />
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {currentItems.length === 0 ? (
                    <Table.Row>
                      <Table.Cell colSpan={5} className="text-center">
                        <Text size="3" color="gray">No history records found.</Text>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    currentItems.map((history) => (
                      <Table.Row key={history.id}>
                        <Table.Cell>
                          <Text size="2" weight="medium" style={{ 
                            color: history.type === 'opd' ? 'var(--blue-9)' : 'var(--green-9)' 
                          }}>
                            {history.type}
                          </Text>
                        </Table.Cell>
                        <Table.RowHeaderCell>{history.patient_name}</Table.RowHeaderCell>
                        <Table.Cell>
                          <Text weight="bold">${getTotalAmount(history.json_data).toFixed(2)}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          {new Date(history.created_at).toLocaleDateString('en-US', {
                            month: 'numeric',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </Table.Cell>
                        <Table.Cell>
                          <Tooltip content="View Prescription PDF">
                            <IconButton
                              size="1"
                              variant="ghost"
                              color="blue"
                              onClick={() => handleViewPdf(history)}
                              disabled={isGeneratingPdf}
                            >
                              {isGeneratingPdf && selectedHistory?.id === history.id ? (
                                <Box className="animate-spin" style={{ width: '14px', height: '14px' }}>
                                  ⟳
                                </Box>
                              ) : (
                                <FileText size={14} />
                              )}
                            </IconButton>
                          </Tooltip>
                        </Table.Cell>
                      </Table.Row>
                    ))
                  )}
                </Table.Body>
              </Table.Root>
            </Card>
          </Box>

          {/* Pagination */}
          {filteredHistories.length > 0 && (
            <Box mt="4">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredHistories.length}
                startIndex={startIndex}
                endIndex={endIndex}
                onPageChange={(page) => {
                  setIsPaginating(true);
                  setCurrentPage(page);
                  setTimeout(() => {
                    if (tableRef.current) {
                      const yOffset = -20;
                      const y = tableRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                    setTimeout(() => setIsPaginating(false), 300);
                  }, 0);
                }}
                onItemsPerPageChange={(newSize) => {
                  setIsPaginating(true);
                  setItemsPerPage(newSize);
                  setCurrentPage(1);
                  setTimeout(() => {
                    if (tableRef.current) {
                      const yOffset = -20;
                      const y = tableRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                      window.scrollTo({ top: y, behavior: 'smooth' });
                    }
                    setTimeout(() => setIsPaginating(false), 300);
                  }, 0);
                }}
              />
            </Box>
          )}

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
                <Button size="2" variant="soft" onClick={handleDownloadPdf}>
                  <Download size={16} />
                  Download
                </Button>
                <Button size="2" variant="soft" onClick={handlePrintPdf}>
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
