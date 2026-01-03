'use client';
import React, { useState, useEffect } from 'react';
import { Box, Flex, Table, Button, TextField, Dialog, Text, Select, IconButton, Tooltip } from "@radix-ui/themes";
import { listPodPatients, createPodPatient, updatePodPatient, deletePodPatient } from '@/utilities/api/podPatients';
import { listAllPatientHistories } from '@/utilities/api/patientHistories';
import { PageHeading } from '@/components/common/PageHeading';
import { PatientNameWithMenu } from '@/components/common/PatientActionsMenu';
import { Search, Plus, RotateCcw, Pencil, Trash2, FileText, Download, Printer } from 'lucide-react';
import Pagination from '@/components/common/Pagination';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DateInput from '@/components/common/DateInput';
import PatientsTableSkeleton from '@/components/opd/PatientsTableSkeleton';

// Interfaces
interface Patient {
  id: number | string;
  name: string;
  telephone?: string | null;
  address?: string | null;
  gender?: 'male' | 'female' | string | null;
  age?: string | null;
  signs_of_life?: string | null;
  symptom?: string | null;
  diagnosis?: string | null;
  email?: string;
  phone?: string;
  city?: string;
  created_at?: string;
  updated_at?: string;
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
  patient_info?: PatientInfo;
  patient?: PatientInfo;
  prescription?: PrescriptionDrug[];
  prescriptions?: PrescriptionDrug[];
  total?: number;
  totalAmount?: number;
}

// Dialog Components
const AddPatientDialog = ({ open, setOpen, onAddPatient }) => {
  const [name, setName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<string>('');

  const handleSubmit = () => {
    if (!name) {
      toast.error('Patient name is required.');
      return;
    }
    const payload = { name, gender, age, telephone, address };
    onAddPatient(payload);
    setOpen(false);
    setName('');
    setTelephone('');
    setAddress('');
    setGender('male');
    setAge('');
    toast.success('Patient added successfully!');
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content style={{ maxWidth: 450 }}>
        <Dialog.Title>Add New Patient</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Fill in the details of the new patient.
        </Dialog.Description>
        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">Name</Text>
            <TextField.Root value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" required />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">Telephone</Text>
            <TextField.Root value={telephone} onChange={(e) => setTelephone(e.target.value)} placeholder="Enter telephone" />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">Age</Text>
            <TextField.Root type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Enter age" min={0} />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">Address</Text>
            <TextField.Root value={address ?? ''} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address" />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">Gender</Text>
            <Select.Root value={gender} onValueChange={(value: 'male' | 'female') => setGender(value)}>
              <Select.Trigger placeholder="Select gender" />
              <Select.Content>
                <Select.Item value="male">Male</Select.Item>
                <Select.Item value="female">Female</Select.Item>
              </Select.Content>
            </Select.Root>
          </label>
        </Flex>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
          <Button onClick={handleSubmit}>Save</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

const EditPatientDialog = ({ open, setOpen, patient, onUpdatePatient }) => {
  const [name, setName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [age, setAge] = useState<string>('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  useEffect(() => {
    if (patient) {
      setName(patient.name ?? '');
      setTelephone((patient.telephone ?? patient.phone ?? '') as string);
      setAge(patient.age?.toString() ?? '');
      setAddress(patient.address ?? '');
      setGender((patient.gender as 'male' | 'female') ?? 'male');
    }
  }, [patient]);

  const handleSubmit = () => {
    if (!name) {
      toast.error('Patient name is required.');
      return;
    }
    const updatedPatient: Partial<Patient> = {
      ...patient, name, telephone,
      age: age !== null ? String(age) : null,
      address, gender,
    };
    onUpdatePatient(updatedPatient);
    setOpen(false);
    toast.success('Patient updated successfully!');
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content style={{ maxWidth: 650, width: '100%' }}>
        <Dialog.Title>Edit Patient</Dialog.Title>
        <Dialog.Description size="2" mb="4">Update the details of the patient.</Dialog.Description>
        <Flex direction="column" gap="3">
          <label><Text as="div" size="2" mb="1" weight="bold">Name</Text><TextField.Root value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter full name" required /></label>
          <label><Text as="div" size="2" mb="1" weight="bold">Telephone</Text><TextField.Root value={telephone ?? ''} onChange={(e) => setTelephone(e.target.value)} placeholder="Enter telephone" /></label>
          <label><Text as="div" size="2" mb="1" weight="bold">Age</Text><TextField.Root type="text" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Enter age" min={0} /></label>
          <label><Text as="div" size="2" mb="1" weight="bold">Address</Text><TextField.Root value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Enter address" /></label>
          <label><Text as="div" size="2" mb="1" weight="bold">Gender</Text>
            <Select.Root value={gender} onValueChange={(value: 'male' | 'female') => setGender(value)}>
              <Select.Trigger placeholder="Select gender" />
              <Select.Content>
                <Select.Item value="male">Male</Select.Item>
                <Select.Item value="female">Female</Select.Item>
              </Select.Content>
            </Select.Root>
          </label>
        </Flex>
        <Flex gap="3" mt="4" justify="end">
          <Dialog.Close><Button variant="soft" color="gray">Cancel</Button></Dialog.Close>
          <Button onClick={handleSubmit}>Save</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

// History Results Table
const HistoryResultsTable = ({ records, isLoading, onViewPdf }) => {
  if (isLoading) {
    return (
      <div data-aos="fade-up">
        <HistoryResultsTableSkeleton />
      </div>
    );
  }
  if (records.length === 0) {
    return <Text>No history records found for this diagnosis.</Text>
  }
  return (
    <div data-aos="fade-up">
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>Patient Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Diagnosis</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Date</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {records.map(history => {
            try {
              const data = JSON.parse(history.json_data);
              const patientInfo = data.patient || data.patient_info;
              return (
                <Table.Row key={history.id}>
                  <Table.Cell>
                    <Button variant="ghost" onClick={() => onViewPdf(history)}>
                      {patientInfo?.name || 'N/A'}
                    </Button>
                  </Table.Cell>
                  <Table.Cell>{patientInfo?.diagnosis || 'N/A'}</Table.Cell>
                  <Table.Cell>{new Date(history.created_at).toLocaleDateString()}</Table.Cell>
                  <Table.Cell>
                    <Tooltip content="View Prescription PDF">
                      <IconButton size="2" variant="ghost" color="blue" onClick={() => onViewPdf(history)}>
                        <FileText size={18} />
                      </IconButton>
                    </Tooltip>
                  </Table.Cell>
                </Table.Row>
              );
            } catch {
              return null;
            }
          })}
        </Table.Body>
      </Table.Root>
    </div>
  );
};

export default function PatientListPage() {
  const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [isAddPatientDialogOpen, setAddPatientDialogOpen] = useState(false);
  const [isEditPatientDialogOpen, setEditPatientDialogOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const tableRef = React.useRef<HTMLDivElement>(null);
  const [diagnosisSearchTerm, setDiagnosisSearchTerm] = useState('');
  const [allHistories, setAllHistories] = useState<any[]>([]);
  const [filteredHistories, setFilteredHistories] = useState<any[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);
  const [isLoadingPatients, setIsLoadingPatients] = useState(true); // New state for patient list loading
  const [selectedHistoryData, setSelectedHistoryData] = useState<HistoryData | null>(null);
  const [isPdfPreviewOpen, setIsPdfPreviewOpen] = useState(false);
  const [selectedHistoryCreatedAt, setSelectedHistoryCreatedAt] = useState<string | null>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Effects for patient list
  useEffect(() => {
    // Dynamically import AOS on client side
    if (typeof window !== 'undefined') {
      import('aos')
        .then((module) => { // Renamed parameter to 'module' for clarity
          module.default.init({ // Correctly access the default export
            duration: 1000,
            once: true,
          });
          // Import AOS CSS after initialization
          import('aos/dist/aos.css');
        })
        .catch((error) => console.error('Failed to load AOS:', error));
    }
  }, []);

  useEffect(() => {
    const load = async () => {
      if (diagnosisSearchTerm) return;
      setIsLoadingPatients(true); // Set loading to true
      try {
        const data = await listPodPatients({ search: searchTerm || undefined, page: currentPage, per_page: itemsPerPage });
        setPatientsData(Array.isArray(data?.data) ? data.data : []);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load patients');
      } finally {
        setIsLoadingPatients(false); // Set loading to false
      }
    };
    load();
  }, [searchTerm, currentPage, itemsPerPage, diagnosisSearchTerm]);

  useEffect(() => {
    if (diagnosisSearchTerm) return;
    let filtered = [...patientsData].filter(patient =>
      !searchTerm ||
      (patient.name && patient.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.telephone && patient.telephone.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    if (genderFilter !== 'all') {
      filtered = filtered.filter(patient => patient.gender === genderFilter);
    }
    if (dateFilter) {
      filtered = filtered.filter(patient =>
        patient.created_at && new Date(patient.created_at).toDateString() === dateFilter.toDateString()
      );
    }
    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [searchTerm, patientsData, genderFilter, dateFilter, diagnosisSearchTerm]);

  // Effects for history search
  useEffect(() => {
    const fetchAllHistories = async () => {
      try {
        const historyData = await listAllPatientHistories();
        setAllHistories(Array.isArray(historyData) ? historyData.filter((h: any) => h.type === 'opd') : []);
      } catch (err) {
        console.error('Failed to fetch all histories:', err);
        toast.error('Failed to load history data for searching.');
      } finally {
        setIsHistoryLoading(false);
      }
    };
    fetchAllHistories();
  }, []);

  useEffect(() => {
    if (!diagnosisSearchTerm) {
      setFilteredHistories([]);
      return;
    }
    const lowercasedTerm = diagnosisSearchTerm.toLowerCase();
    const historiesWithDiagnosis = allHistories.filter(history => {
      try {
        const data = JSON.parse(history.json_data);
        const patientInfo = data.patient || data.patient_info;
        return patientInfo?.diagnosis?.toLowerCase().includes(lowercasedTerm);
      } catch {
        return false;
      }
    });
    setFilteredHistories(historiesWithDiagnosis);
  }, [diagnosisSearchTerm, allHistories]);

  // PDF generation logic
  useEffect(() => {
    if (!isPdfPreviewOpen && pdfPreviewUrl) {
      URL.revokeObjectURL(pdfPreviewUrl);
      setPdfPreviewUrl(null);
    }
  }, [isPdfPreviewOpen, pdfPreviewUrl]);

  const handleViewPdf = async (historyRecord: any) => {
    setIsGeneratingPdf(true);
    try {
      const data: HistoryData = JSON.parse(historyRecord.json_data);
      setSelectedHistoryData(data);
      setSelectedHistoryCreatedAt(historyRecord.created_at);
      const { generatePdfFromComponent } = await import('@/utilities/pdf');
      const { blob } = await generatePdfFromComponent(data, historyRecord.created_at);
      setPdfPreviewUrl(URL.createObjectURL(blob));
      setIsPdfPreviewOpen(true);
    } catch (e) {
      console.error('Failed to parse history data:', e);
      toast.error('Failed to load history details.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

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

  const printPdf = () => {
    if (!pdfPreviewUrl) return;
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = pdfPreviewUrl;
    document.body.appendChild(iframe);
    iframe.onload = () => iframe.contentWindow?.print();
  };

  // CRUD handlers
  const handleAddPatient = async (payload: any) => {
    try {
      const { normalizePatientPayload } = await import('@/utilities/api/normalizePatient');
      const saved = await createPodPatient(normalizePatientPayload(payload));
      setPatientsData(prev => [saved, ...prev]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to add patient');
    }
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    const originalPatients = [...patientsData];
    setPatientsData(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setEditPatientDialogOpen(false);
    try {
      await updatePodPatient(updatedPatient.id as string, updatedPatient);
      toast.success('Patient updated successfully!');
    }
    catch (e: any) {
      console.error('Failed to update patient:', e);
      toast.error(e.detail?.message || e.message || 'Failed to update patient');
      setPatientsData(originalPatients);
    }
  };

  function handleEditPatient(patient: Patient) {
    setPatientToEdit(patient);
    setEditPatientDialogOpen(true);
  }

  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    const originalPatients = [...patientsData];
    setPatientsData(prev => prev.filter(p => p.id !== patientToDelete.id));
    setConfirmDialogOpen(false);
    try {
      await deletePodPatient(patientToDelete.id);
      toast.success(`Patient "${patientToDelete.name}" deleted successfully.`);
    } catch (e: any) {
      setPatientsData(originalPatients);
      console.error(e);
      toast.error(e?.detail?.message || e?.message || 'Failed to delete patient');
    }
    setPatientToDelete(null);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setDiagnosisSearchTerm('');
    setGenderFilter('all');
    setDateFilter(null);
  };

      const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = Math.min(startIndex + itemsPerPage, filteredPatients.length);
      const currentItems = filteredPatients.slice(startIndex, endIndex);
  return (
    <Box className="space-y-4 w-full px-4">
      <PageHeading title={diagnosisSearchTerm ? 'History Search Results' : 'Patient List'} description={diagnosisSearchTerm ? 'Showing history records matching the diagnosis' : 'View and manage all patients'} />


      {!diagnosisSearchTerm && (
        <Flex justify="start" mb="5">
          <Button onClick={() => setAddPatientDialogOpen(true)}><Plus size={16} /> Add Patient</Button>
        </Flex>
      )}

      <Box className="w-full">
        <Flex gap="4" align="center" wrap="wrap" className="w-full">
          <Box className="flex-grow min-w-[250px]">
            <TextField.Root placeholder="Search by diagnosis to see history..." value={diagnosisSearchTerm} onChange={(e) => setDiagnosisSearchTerm(e.target.value)}>
              <TextField.Slot><Search size={16} /></TextField.Slot>
            </TextField.Root>
          </Box>
          {!diagnosisSearchTerm && (
            <>
              <Box className="flex-grow min-w-[250px]">
                <TextField.Root placeholder="Search by name, phone..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}>
                  <TextField.Slot><Search size={16} /></TextField.Slot>
                </TextField.Root>
              </Box>
              <Flex align="center" gap="2" className="flex-shrink-0">
                <Select.Root value={genderFilter} onValueChange={setGenderFilter}>
                  <Select.Trigger placeholder="All Genders" />
                  <Select.Content>
                    <Select.Item value="all">All Genders</Select.Item>
                    <Select.Item value="male">Male</Select.Item>
                    <Select.Item value="female">Female</Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>
              <Box className="flex-shrink-0" style={{ minWidth: '150px' }}>
                <DateInput value={dateFilter} onChange={setDateFilter} />
              </Box>
            </>
          )}
          <Button variant="soft" color={genderFilter !== 'all' || !!dateFilter || !!searchTerm || !!diagnosisSearchTerm ? 'red' : 'gray'} onClick={handleResetFilters}>
            <RotateCcw size={16} /> Reset Filters
          </Button>
        </Flex>
      </Box>

      {diagnosisSearchTerm ? (
        <HistoryResultsTable records={filteredHistories} isLoading={isHistoryLoading} onViewPdf={handleViewPdf} />
      ) : (
        <div data-aos="fade-up">
          {isLoadingPatients ? (
            <PatientsTableSkeleton />
          ) : (
            <>
              <Box ref={tableRef} style={{ position: 'relative' }}>
                <Table.Root variant="surface" style={{ width: '100%' }}>
                  <Table.Header><Table.Row><Table.ColumnHeaderCell>No</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Telephone</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Age</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Address</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Gender</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Created At</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Updated At</Table.ColumnHeaderCell><Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell></Table.Row></Table.Header>
                  <Table.Body>
                    {currentItems.length === 0 ? (
                      <Table.Row><Table.Cell colSpan={9} className="text-center"><Text size="3" color="gray">No patients found.</Text></Table.Cell></Table.Row>
                    ) : (
                      currentItems.map((patient, index) => (
                        <Table.Row key={patient.id}>
                          <Table.Cell>{(currentPage - 1) * itemsPerPage + index + 1}</Table.Cell>
                          <Table.RowHeaderCell><Flex align="center" justify="between"><PatientNameWithMenu patient={patient} /></Flex></Table.RowHeaderCell>
                          <Table.Cell>{patient.telephone || patient.phone || '-'}</Table.Cell>
                          <Table.Cell>{patient.age || '-'}</Table.Cell>
                          <Table.Cell>{patient.address || '-'}</Table.Cell>
                          <Table.Cell>{patient.gender || '-'}</Table.Cell>
                          <Table.Cell>{patient.created_at ? new Date(patient.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</Table.Cell>
                          <Table.Cell>{patient.updated_at ? new Date(patient.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</Table.Cell>
                          <Table.Cell><Flex gap="2">
                            <Tooltip content="Edit Patient"><IconButton size="1" variant="ghost" color="blue" onClick={() => handleEditPatient(patient)}><Pencil size={14} /></IconButton></Tooltip>
                            <Tooltip content="Delete Patient"><IconButton size="1" variant="ghost" color="red" onClick={() => handleDeletePatient(patient)}><Trash2 size={14} /></IconButton></Tooltip>
                          </Flex></Table.Cell>
                        </Table.Row>
                      ))
                    )}
                  </Table.Body>
                </Table.Root>
              </Box>
              {filteredPatients.length > 0 && (
                <Box mt="4">
                  <Pagination currentPage={currentPage} totalPages={totalPages} itemsPerPage={itemsPerPage} totalItems={filteredPatients.length} startIndex={startIndex} endIndex={endIndex} onPageChange={setCurrentPage} onItemsPerPageChange={setItemsPerPage} />
                </Box>
              )}
            </>
          )}
        </div>
      )}
      <AddPatientDialog open={isAddPatientDialogOpen} setOpen={setAddPatientDialogOpen} onAddPatient={handleAddPatient} />
      <EditPatientDialog open={isEditPatientDialogOpen} setOpen={setEditPatientDialogOpen} patient={patientToEdit} onUpdatePatient={handleUpdatePatient} />
      <ConfirmDialog open={isConfirmDialogOpen} onOpenChange={setConfirmDialogOpen} title="Delete Patient" description={`Are you sure you want to delete patient "${patientToDelete?.name}"? This action cannot be undone.`} onConfirm={confirmDelete} />
      <Dialog.Root open={isPdfPreviewOpen} onOpenChange={setIsPdfPreviewOpen}>
        <Dialog.Content style={{ maxWidth: '90vw', maxHeight: '90vh', padding: 0 }}>
          <Flex direction="column" style={{ height: '90vh' }}>
            <Flex justify="between" align="center" p="4" style={{ borderBottom: '1px solid var(--gray-6)' }}>
              <Dialog.Title>View Prescription PDF</Dialog.Title>
              <Flex gap="2">
                <Button size="2" variant="soft" color="gray" onClick={() => setIsPdfPreviewOpen(false)}>Cancel</Button>
                <Button size="2" variant="soft" onClick={downloadPdf}><Download size={16} /> Download</Button>
                <Button size="2" variant="soft" onClick={printPdf}><Printer size={16} /> Print</Button>
              </Flex>
            </Flex>
            <Box style={{ flex: 1, position: 'relative' }}>
              {isGeneratingPdf ? (
                <Flex justify="center" align="center" style={{ height: '100%' }}><Flex direction="column" align="center" gap="3"><Box className="animate-spin" style={{ width: '48px', height: '48px', border: '4px solid var(--gray-6)', borderTopColor: 'var(--blue-9)', borderRadius: '50%' }} /><Text>Generating PDF...</Text></Flex></Flex>
              ) : pdfPreviewUrl ? (
                <iframe src={pdfPreviewUrl} style={{ width: '100%', height: '100%', border: 'none' }} title="PDF Preview" />
              ) : null}
            </Box>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  );
}