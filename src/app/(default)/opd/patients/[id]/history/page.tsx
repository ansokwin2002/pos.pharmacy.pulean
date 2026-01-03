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
import { ArrowLeft, FileText, Download, Printer, Search, Pencil } from 'lucide-react';
import { getPatientHistoriesByPatientId } from '@/utilities/api/patientHistories';
import { useMemo } from 'react';

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

  // Memoize the filtered histories to avoid re-calculating on every render
  const filteredHistories = useMemo(() => {
    return histories.filter((history) => {
      try {
        const data: HistoryData = JSON.parse(history.json_data);
        const patientInfo = data.patient || data.patient_info;
        const searchLower = searchTerm.toLowerCase();
        
        return (
          String(history.id).toLowerCase().includes(searchLower) ||
          history.type.toLowerCase().includes(searchLower) ||
          (patientInfo?.name || '').toLowerCase().includes(searchLower) ||
          new Date(history.created_at).toLocaleDateString().includes(searchLower)
        );
      } catch {
        // If json_data is malformed, don't include it in results
        return false;
      }
    });
  }, [histories, searchTerm]);

  // Calculate pagination based on memoized filtered histories
  const totalItems = filteredHistories.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedHistories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredHistories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredHistories, currentPage, itemsPerPage]);

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
      const { generatePdfFromComponent } = await import('@/utilities/pdf');
      const { blob } = await generatePdfFromComponent(data, historyRecord.created_at);
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
      
      setIsPdfPreviewOpen(true);
    } catch (e) {
      console.error('Failed to parse history data:', e);
      toast.error('Failed to load history details.');
    } finally {
      setIsGeneratingPdf(false);
    }
      }
    const downloadPdf = async () => {
    if (!selectedHistoryData || !selectedHistoryCreatedAt) return;
    try {
      const { generatePdfFromComponent } = await import('@/utilities/pdf');
      const { blob, fileName } = await generatePdfFromComponent(selectedHistoryData, selectedHistoryCreatedAt);
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);

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
            {paginatedHistories.length === 0 ? (
              <Table.Row>
                <Table.Cell colSpan={6}>
                  <Text align="center" className="py-4 text-slate-500">
                    {searchTerm ? 'No matching records found.' : 'No history records found for this patient.'}
                  </Text>
                </Table.Cell>
              </Table.Row>
            ) : (
              paginatedHistories.map((history) => {
                const data: HistoryData = JSON.parse(history.json_data);
                const patientInfo = data.patient || data.patient_info;
                const totalAmount = data.totalAmount ?? data.total ?? 0;
                return (
                  <Table.Row key={history.id}>
                    <Table.Cell>{history.id}</Table.Cell>
                    <Table.Cell>{history.type}</Table.Cell>
                    <Table.Cell>
                      <Button variant="ghost" onClick={() => handleViewPdf(history)}>
                        {patientInfo?.name || 'N/A'}
                      </Button>
                    </Table.Cell>
                    <Table.Cell>${totalAmount.toFixed(2)}</Table.Cell>
                    <Table.Cell>{new Date(history.created_at).toLocaleDateString()}</Table.Cell>
                    <Table.Cell>
                      <Flex gap="3">
                        <Tooltip content="View Prescription PDF">
                          <IconButton
                            size="2"
                            variant="ghost"
                            color="blue"
                            onClick={() => handleViewPdf(history)}
                            disabled={isGeneratingPdf}
                          >
                            {isGeneratingPdf ? (
                              <Box className="animate-spin" style={{ width: '18px', height: '18px' }}>
                                ⟳
                              </Box>
                            ) : (
                              <FileText size={18} />
                            )}
                          </IconButton>
                        </Tooltip>
                        <Tooltip content="Edit Record">
                          <IconButton
                            size="2"
                            variant="ghost"
                            color="blue"
                            onClick={() => {
                              router.push(`/opd/register?id=${patientId}`);
                            }}
                          >
                            <Pencil size={18} />
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

        {/* Pagination */}
        {totalItems > 0 && (
          <Box mt="4">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalItems}
              startIndex={(currentPage - 1) * itemsPerPage}
              endIndex={Math.min(((currentPage - 1) * itemsPerPage) + itemsPerPage, totalItems)}
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
        )}
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
