'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Dialog,
  Skeleton
} from '@radix-ui/themes';
import { PageHeading } from '@/components/common/PageHeading';
import { Search, FileText, Download, Printer } from 'lucide-react';
import { SortableHeader } from '@/components/common/SortableHeader';
import Pagination from '@/components/common/Pagination';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import DateInput from '@/components/common/DateInput';
import AllHistoryTableSkeleton from '@/components/opd/AllHistoryTableSkeleton';
import { patientHistoryData } from '@/data/PatientHistoryData';
import { format } from 'date-fns';

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
  const [unpaginatedFilteredHistories, setUnpaginatedFilteredHistories] = useState<PatientHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: keyof PatientHistory; direction: 'asc' | 'desc' } | null>(null);
  const [selectedHistory, setSelectedHistory] = useState<PatientHistory | null>(null);
  const tableRef = React.useRef<HTMLDivElement>(null);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [selectedHistoryFileName, setSelectedHistoryFileName] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      import('aos')
        .then((module) => {
          module.default.init({
            duration: 1000,
            once: true,
          });
          import('aos/dist/aos.css');
        })
        .catch((error) => console.error('Failed to load AOS:', error));
    }
  }, []);


  const handleSort = (key: keyof PatientHistory) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleResetFilters = useCallback(() => {
    setSearchTerm('');
    setDateFilter(null);
  }, [setSearchTerm, setDateFilter]); // Add dependencies for useCallback

  const handleDownloadPdf = () => {
    if (pdfPreviewUrl && selectedHistoryFileName) { // Use selectedHistoryFileName
      const link = document.createElement('a');
      link.href = pdfPreviewUrl;
      link.download = selectedHistoryFileName; // Use the saved filename
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

  const handleViewPdf = async (history: PatientHistory) => {
    setIsGeneratingPdf(true);
    setSelectedHistory(history);
    
    try {
      const data: HistoryData = JSON.parse(history.json_data);
      const { generatePdfFromComponent } = await import('@/utilities/pdf/generatePdfFromComponent');
      const { blob, fileName } = await generatePdfFromComponent(data, history.created_at);
      const url = URL.createObjectURL(blob);
      setPdfPreviewUrl(url);
      setSelectedHistoryFileName(fileName); // Save the filename
      setIsPdfPreviewOpen(true);
    } catch (e: any) { // Explicitly type e as any for now to access message
      console.error('Failed to generate PDF:', e);
      toast.error(`Failed to generate PDF: ${e.message || e}`); // Display the error message
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const filteredAndSortedHistories = useMemo(() => {
    let newFilteredHistories = [...histories];

    // Filtering logic
    if (searchTerm) {
      newFilteredHistories = newFilteredHistories.filter(history =>
        history.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        history.created_at.includes(searchTerm)
      );
    }

    if (dateFilter) {
      const filterDate = format(dateFilter, 'yyyy-MM-dd');
      newFilteredHistories = newFilteredHistories.filter(history =>
        format(new Date(history.created_at), 'yyyy-MM-dd') === filterDate
      );
    }

    // Sorting logic
    if (sortConfig !== null) {
      newFilteredHistories.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (aValue === null || aValue === undefined) return sortConfig.direction === 'asc' ? 1 : -1;
        if (bValue === null || bValue === undefined) return sortConfig.direction === 'asc' ? -1 : 1;

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'asc'
            ? aValue - bValue
            : bValue - aValue;
        }

        // Fallback for other types, compare as strings
        return sortConfig.direction === 'asc'
          ? String(aValue).localeCompare(String(bValue))
          : String(bValue).localeCompare(String(aValue));
      });
    }
    return newFilteredHistories;
  }, [histories, searchTerm, dateFilter, sortConfig]);

  // Update unpaginatedFilteredHistories whenever filteredAndSortedHistories changes
  useEffect(() => {
    setUnpaginatedFilteredHistories(filteredAndSortedHistories);
    setCurrentPage(1); // Reset to first page when filters or sort change
  }, [filteredAndSortedHistories]);

  // Effect to fetch histories when component mounts
  useEffect(() => {
    setIsLoading(true);
    
    const apiUrl = '/api';

    fetch(`${apiUrl}/patient-histories`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch patient histories');
        }
        return response.json();
      })
      .then(data => {
        const processedData = data.map((history: any) => {
            let jsonData: HistoryData = {};
            try {
                jsonData = JSON.parse(history.json_data);
            } catch (e) {
                console.error('Failed to parse json_data for history:', history.id);
            }
            
            const patientInfo = jsonData.patient_info || jsonData.patient;

            return {
                ...history,
                id: String(history.id), // Ensure ID is a string
                patient_name: patientInfo?.name || 'N/A',
                patient_id: patientInfo?.id || '',
            };
        });
        setHistories(processedData);
      })
      .catch(error => {
        console.error('Failed to fetch patient histories:', error);
        toast.error('Failed to fetch patient histories. Displaying mock data instead.');
        setHistories(patientHistoryData); // Fallback to mock data
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // Empty dependency array means this runs once on mount

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

  const totalPages = Math.ceil(unpaginatedFilteredHistories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, unpaginatedFilteredHistories.length);
  const currentItems = unpaginatedFilteredHistories.slice(startIndex, endIndex);

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
      {isLoading ? (
        <div data-aos="fade-up">
          <AllHistoryTableSkeleton />
        </div>
      ) : (
        <div data-aos="fade-up">
          <Box ref={tableRef}>
            <Card>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>No</Table.ColumnHeaderCell>
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
                    currentItems.map((history, index) => (
                      <Table.Row key={history.id}>
                        <Table.Cell>{(currentPage - 1) * itemsPerPage + index + 1}</Table.Cell>
                        <Table.Cell>
                          <Text size="2" weight="medium" style={{ 
                            color: history.type === 'opd' ? 'var(--blue-9)' : 'var(--green-9)' 
                          }}>
                            {history.type}
                          </Text>
                        </Table.Cell>
                        <Table.RowHeaderCell>
                          <Button variant="ghost" onClick={() => handleViewPdf(history)}>
                            {history.patient_name}
                          </Button>
                        </Table.RowHeaderCell>
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
                              size="2"
                              variant="ghost"
                              color="blue"
                              onClick={() => handleViewPdf(history)}
                              disabled={isGeneratingPdf}
                            >
                              {isGeneratingPdf && selectedHistory?.id === history.id ? (
                                <Box className="animate-spin" style={{ width: '18px', height: '18px' }}>
                                  ⟳
                                </Box>
                              ) : (
                                <FileText size={18} />
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
        </div>
      )}

      {/* Pagination */}
      {unpaginatedFilteredHistories.length > 0 && (
        <Box mt="4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            totalItems={unpaginatedFilteredHistories.length}
            startIndex={startIndex}
            endIndex={endIndex}
            onPageChange={(page) => {
              setCurrentPage(page);
              setTimeout(() => {
                if (tableRef.current) {
                  const yOffset = -20;
                  const y = tableRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
              }, 0);
            }}
            onItemsPerPageChange={(newSize) => {
              setItemsPerPage(newSize);
              setCurrentPage(1);
              setTimeout(() => {
                if (tableRef.current) {
                  const yOffset = -20;
                  const y = tableRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                }
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
