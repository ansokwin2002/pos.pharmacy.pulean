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
  Tooltip
} from '@radix-ui/themes';
import { PageHeading } from '@/components/common/PageHeading';
import { Search, FileText, Eye } from 'lucide-react';
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

  useEffect(() => {
    loadAllHistories();
  }, []);

  const loadAllHistories = async () => {
    setIsPaginating(true);
    try {
      const { getPatientHistoriesByPatientId } = await import('@/utilities/api/patientHistories');
      
      // For now, we'll need to get all patient IDs first
      // This is a simplified approach - you might want to create a dedicated API endpoint
      const { listPodPatients } = await import('@/utilities/api/podPatients');
      const patientsResponse = await listPodPatients({ per_page: 1000 });
      const patients = Array.isArray(patientsResponse?.data) ? patientsResponse.data : patientsResponse;
      
      // Fetch histories for all patients
      const allHistories: PatientHistory[] = [];
      
      for (const patient of patients) {
        try {
          const patientHistories = await getPatientHistoriesByPatientId(patient.id);
          if (patientHistories && patientHistories.length > 0) {
            // Add patient name to each history record
            const historiesWithName = patientHistories.map((h: any) => ({
              ...h,
              patient_name: patient.name,
              patient_id: patient.id
            }));
            allHistories.push(...historiesWithName);
          }
        } catch (error) {
          console.error(`Failed to load history for patient ${patient.id}:`, error);
        }
      }
      
      setHistories(allHistories);
      setFilteredHistories(allHistories);
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

  const handleViewHistory = (history: PatientHistory) => {
    router.push(`/opd/patients/${history.patient_id}/history`);
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
                        label="ID"
                        sortKey="id"
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
                    <Table.ColumnHeaderCell>
                      <SortableHeader
                        label="Type"
                        sortKey="type"
                        currentSort={sortConfig}
                        onSort={handleSort}
                      />
                    </Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Items</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Total Amount</Table.ColumnHeaderCell>
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
                      <Table.Cell colSpan={7} className="text-center">
                        <Text size="3" color="gray">No history records found.</Text>
                      </Table.Cell>
                    </Table.Row>
                  ) : (
                    currentItems.map((history) => (
                      <Table.Row key={history.id}>
                        <Table.Cell>{String(history.id).substring(0, 8)}</Table.Cell>
                        <Table.RowHeaderCell>{history.patient_name}</Table.RowHeaderCell>
                        <Table.Cell>
                          <Text size="2" weight="medium" style={{ 
                            color: history.type === 'prescription' ? 'var(--blue-9)' : 'var(--green-9)' 
                          }}>
                            {history.type}
                          </Text>
                        </Table.Cell>
                        <Table.Cell>{getPrescriptionCount(history.json_data)}</Table.Cell>
                        <Table.Cell>
                          <Text weight="bold">${getTotalAmount(history.json_data).toFixed(2)}</Text>
                        </Table.Cell>
                        <Table.Cell>
                          {new Date(history.created_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Table.Cell>
                        <Table.Cell>
                          <Tooltip content="View Patient History">
                            <IconButton
                              size="1"
                              variant="ghost"
                              color="blue"
                              onClick={() => handleViewHistory(history)}
                            >
                              <Eye size={14} />
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
    </Box>
  );
}
