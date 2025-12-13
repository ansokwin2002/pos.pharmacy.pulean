'use client';
import React, { useState, useEffect } from 'react';
import { Box, Flex, Table, Button, TextField, Dialog, Text, Select, IconButton, Tooltip } from "@radix-ui/themes";
import { listPodPatients, createPodPatient, updatePodPatient, deletePodPatient } from '@/utilities/api/podPatients';
import { PageHeading } from '@/components/common/PageHeading';
import { PatientNameWithMenu } from '@/components/common/PatientActionsMenu';
import { Search, Plus, RotateCcw, Pencil, Trash2 } from 'lucide-react';
import { SortableHeader } from '@/components/common/SortableHeader';
import Pagination from '@/components/common/Pagination';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import DateInput from '@/components/common/DateInput';

interface Patient {
  id: number | string;
  name: string;
  telephone?: string | null;
  address?: string | null;
  gender?: 'male' | 'female' | string | null;
  age?: number | null;
  signs_of_life?: string | null;
  symptom?: string | null;
  diagnosis?: string | null;
  email?: string;
  phone?: string;
  city?: string;
}

const AddPatientDialog = ({ open, setOpen, onAddPatient }) => {
  const [name, setName] = useState('');
  const [telephone, setTelephone] = useState('');
  const [address, setAddress] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<string>('');
  const [symptom, setSymptom] = useState('');
  const [diagnosis, setDiagnosis] = useState('');


  const handleSubmit = () => {
    if (!name) {
      toast.error('Patient name is required.');
      return;
    }
    const payload = { name, gender, age, telephone, address, symptom, diagnosis };
    onAddPatient(payload);
    setOpen(false);
    setName('');
    setTelephone('');
    setAddress('');
    setGender('male');
    setAge('');
    setSymptom('');
    setDiagnosis('');
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
            <Text as="div" size="2" mb="1" weight="bold">
              Name
            </Text>
            <TextField.Root
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => {
                if (/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="Enter full name"
              required
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Telephone
            </Text>
            <TextField.Root
              value={telephone}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Enter telephone"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Age
            </Text>
            <TextField.Root
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
              min={0}
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Address
            </Text>
            <TextField.Root
              value={address ?? ''}
              onChange={(e) => setAddress(e.target.value)}
              onKeyPress={(e) => {
                if (/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="Enter address"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Symptom
            </Text>
            <TextField.Root
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              onKeyPress={(e) => {
                if (/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="Enter symptom"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Diagnosis
            </Text>
            <TextField.Root
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              onKeyPress={(e) => {
                if (/[0-9]/.test(e.key)) {
                  e.preventDefault();
                }
              }}
              placeholder="Enter diagnosis"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Gender
            </Text>
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
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
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
  const [symptom, setSymptom] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  useEffect(() => {
    if (patient) {
      setName(patient.name ?? '');
      setTelephone((patient.telephone ?? patient.phone ?? '') as string);
      setAge(patient.age?.toString() ?? '');
      setAddress(patient.address ?? '');
      setSymptom(patient.symptom ?? '');
      setDiagnosis(patient.diagnosis ?? '');
      setGender((patient.gender as 'male' | 'female') ?? 'male');
    }
  }, [patient]);

  const handleSubmit = () => {
    if (!name) {
      toast.error('Patient name is required.');
      return;
    }
    const updatedPatient: Patient = {
      ...patient,
      name,
      telephone,
      age: age ? parseInt(age) : undefined,
      address,
      symptom,
      diagnosis,
      gender,
    };
    onUpdatePatient(updatedPatient);
    setOpen(false);
    toast.success('Patient updated successfully!');
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content style={{ maxWidth: 650, width: '100%' }}>
        <Dialog.Title>Edit Patient</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Update the details of the patient.
        </Dialog.Description>

        <Flex direction="column" gap="3">
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Name
            </Text>
            <TextField.Root
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter full name"
              required
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Telephone
            </Text>
            <TextField.Root
              value={telephone ?? ''}
              onChange={(e) => setTelephone(e.target.value)}
              placeholder="Enter telephone"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Age
            </Text>
            <TextField.Root
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Enter age"
              min={0}
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Address
            </Text>
            <TextField.Root
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Enter address"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Symptom
            </Text>
            <TextField.Root
              value={symptom}
              onChange={(e) => setSymptom(e.target.value)}
              placeholder="Enter symptom"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Diagnosis
            </Text>
            <TextField.Root
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              placeholder="Enter diagnosis"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Gender
            </Text>
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
          <Dialog.Close>
            <Button variant="soft" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Button onClick={handleSubmit}>Save</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default function PatientListPage() {
  const [patientsData, setPatientsData] = useState<Patient[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<Date | null>(null);
  const [diagnosisFilter, setDiagnosisFilter] = useState('');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Patient; direction: 'asc' | 'desc' } | null>(null);
  const [isAddPatientDialogOpen, setAddPatientDialogOpen] = useState(false);
  const [isEditPatientDialogOpen, setEditPatientDialogOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isPaginating, setIsPaginating] = useState(false);
  const tableRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const load = async () => {
      setIsPaginating(true);
      try {
        const data = await listPodPatients({ search: searchTerm || undefined, page: currentPage, per_page: itemsPerPage });
        const items = Array.isArray(data?.data) ? data.data : data;
        setPatientsData(items);
      } catch (e) {
        console.error(e);
        toast.error('Failed to load patients');
      } finally {
        setIsPaginating(false);
      }
    };
    load();
  }, [searchTerm, currentPage, itemsPerPage]);

  useEffect(() => {
    let sortedPatients = [...patientsData];
    if (sortConfig !== null) {
      sortedPatients.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    const lowercasedFilter = searchTerm.toLowerCase();
    let filtered = sortedPatients.filter(patient => {
      // Search by name
      if (patient.name && patient.name.toLowerCase().includes(lowercasedFilter)) return true;
      
      // Search by telephone
      if (patient.telephone && patient.telephone.toLowerCase().includes(lowercasedFilter)) return true;
      if (patient.phone && patient.phone.toLowerCase().includes(lowercasedFilter)) return true;
      
      // Search by address
      if (patient.address && patient.address.toLowerCase().includes(lowercasedFilter)) return true;
      
      // Search by symptom
      if (patient.symptom && patient.symptom.toLowerCase().includes(lowercasedFilter)) return true;
      
      // Search by diagnosis
      if (patient.diagnosis && patient.diagnosis.toLowerCase().includes(lowercasedFilter)) return true;
      
      // Search by created_at date
      if (patient.created_at) {
        const createdDate = new Date(patient.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        if (createdDate.toLowerCase().includes(lowercasedFilter)) return true;
      }
      
      // Search by updated_at date
      if (patient.updated_at) {
        const updatedDate = new Date(patient.updated_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
        if (updatedDate.toLowerCase().includes(lowercasedFilter)) return true;
      }
      
      return false;
    });

    if (genderFilter !== 'all') {
      filtered = filtered.filter(patient => patient.gender === genderFilter);
    }

    if (dateFilter) {
      filtered = filtered.filter(patient => {
        if (!patient.created_at) return false;
        
        // Parse patient date and filter date
        const patientDate = new Date(patient.created_at);
        const filterDate = new Date(dateFilter);
        
        // Compare year, month, and day separately to avoid timezone issues
        const patientYear = patientDate.getFullYear();
        const patientMonth = patientDate.getMonth();
        const patientDay = patientDate.getDate();
        
        const filterYear = filterDate.getFullYear();
        const filterMonth = filterDate.getMonth();
        const filterDay = filterDate.getDate();
        
        return patientYear === filterYear && 
               patientMonth === filterMonth && 
               patientDay === filterDay;
      });
    }

    if (diagnosisFilter) {
      const diagnosisLower = diagnosisFilter.toLowerCase();
      filtered = filtered.filter(patient => 
        patient.diagnosis && patient.diagnosis.toLowerCase().includes(diagnosisLower)
      );
    }

    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [searchTerm, sortConfig, patientsData, genderFilter, dateFilter, diagnosisFilter]);

  const handleSort = (key: keyof Patient) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddPatient = async (payload: any) => {
    try {
      const { normalizePatientPayload } = await import('@/utilities/api/normalizePatient');
      const normalized = normalizePatientPayload(payload);
      const saved = await createPodPatient(normalized);
      setPatientsData(prev => [saved, ...prev]);
    } catch (e) {
      console.error(e);
      toast.error('Failed to add patient');
    }
  };

  const handleEditPatient = (patient: Patient) => {
    setPatientToEdit(patient);
    setEditPatientDialogOpen(true);
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    const originalPatients = [...patientsData];
    // Optimistic UI update
    setPatientsData(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
    setEditPatientDialogOpen(false);
    setPatientToEdit(null);

    try {
      await updatePodPatient(updatedPatient.id as string, updatedPatient);
      toast.success('Patient updated successfully!');
    } catch (e: any) {
      console.error('Failed to update patient:', e);
      toast.error(e.detail?.message || e.message || 'Failed to update patient');
      // Rollback on failure
      setPatientsData(originalPatients);
    }
  };

  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!patientToDelete) {
      setConfirmDialogOpen(false);
      return;
    }
    const deleting = patientToDelete;
    // Optimistic UI update
    setPatientsData(prev => prev.filter(p => p.id !== deleting.id));
    setConfirmDialogOpen(false);
    setPatientToDelete(null);
    try {
      await deletePodPatient(deleting.id);
      toast.success(`Patient \"${deleting.name}\" deleted successfully.`);
    } catch (e: any) {
      // Rollback on failure
      setPatientsData(prev => [deleting, ...prev]);
      console.error(e);
      const msg = e?.detail?.message || e?.message || 'Failed to delete patient';
      toast.error(msg);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setGenderFilter('all');
    setDateFilter(null);
    setDiagnosisFilter('');
  };

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredPatients.length);
  const currentItems = filteredPatients.slice(startIndex, endIndex);

  return (
    <Box className="space-y-4 w-full px-4">
      <Flex justify="between" align="start" mb="5" className="w-full">
        <PageHeading title="Patient List" description="View and manage all patients" />
      </Flex>
      <Flex justify="start" mb="5"> {/* New Flex container to align button to the right, or adjust as needed */}
        <Button onClick={() => setAddPatientDialogOpen(true)}>
          <Plus size={16} /> Add Patient
        </Button>
      </Flex>

      <Box className="w-full">
        <Flex gap="4" align="center" wrap="wrap" className="w-full">
          <Box className="flex-grow min-w-[250px]">
            <TextField.Root
              placeholder="Search by name, phone, address, symptom, diagnosis, date..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            >
              <TextField.Slot>
                <Search size={16} />
              </TextField.Slot>
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
            <DateInput
              value={dateFilter}
              onChange={(date) => setDateFilter(date)}
            />
          </Box>
          <Box className="flex-shrink-0" style={{ minWidth: '200px' }}>
            <TextField.Root
              placeholder="Search by diagnosis..."
              value={diagnosisFilter}
              onChange={(e) => setDiagnosisFilter(e.target.value)}
            />
          </Box>
          <Button variant="soft" color={genderFilter !== 'all' || dateFilter || diagnosisFilter ? 'red' : 'gray'} onClick={handleResetFilters}>
            <RotateCcw size={16} />
            Reset Filters
          </Button>
        </Flex>
      </Box>

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
            <Table.Root variant="surface" style={{ width: '100%' }}>
              <Table.Header>
                <Table.Row>
                  <Table.ColumnHeaderCell>
                    <SortableHeader
                      label="Name"
                      sortKey="name"
                      currentSort={sortConfig}
                      onSort={handleSort}
                    />
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <SortableHeader
                      label="Telephone"
                      sortKey="telephone"
                      currentSort={sortConfig}
                      onSort={handleSort}
                    />
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <SortableHeader
                      label="Age"
                      sortKey="age"
                      currentSort={sortConfig}
                      onSort={handleSort}
                    />
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <SortableHeader
                      label="Address"
                      sortKey="address"
                      currentSort={sortConfig}
                      onSort={handleSort}
                    />
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <SortableHeader
                      label="Symptom"
                      sortKey="symptom"
                      currentSort={sortConfig}
                      onSort={handleSort}
                    />
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <SortableHeader
                      label="Diagnosis"
                      sortKey="diagnosis"
                      currentSort={sortConfig}
                      onSort={handleSort}
                    />
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <SortableHeader
                      label="Gender"
                      sortKey="gender"
                      currentSort={sortConfig}
                      onSort={handleSort}
                    />
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <SortableHeader
                      label="Created At"
                      sortKey="created_at"
                      currentSort={sortConfig}
                      onSort={handleSort}
                    />
                  </Table.ColumnHeaderCell>
                  <Table.ColumnHeaderCell>
                    <SortableHeader
                      label="Updated At"
                      sortKey="updated_at"
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
                    <Table.Cell colSpan={10} className="text-center">
                      <Text size="3" color="gray">No patients found.</Text>
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  currentItems.map((patient) => {
                    return (
                      <Table.Row key={patient.id}>
                        <Table.RowHeaderCell>
                          <Flex align="center" justify="between">
                            <PatientNameWithMenu
                              patient={patient}
                            />
                          </Flex>
                        </Table.RowHeaderCell>
                        <Table.Cell>{patient.telephone || patient.phone || '-'}</Table.Cell>
                        <Table.Cell>{patient.age || '-'}</Table.Cell>
                        <Table.Cell>{patient.address || '-'}</Table.Cell>
                        <Table.Cell>{patient.symptom || '-'}</Table.Cell>
                        <Table.Cell>{patient.diagnosis || '-'}</Table.Cell>
                        <Table.Cell>{patient.gender || '-'}</Table.Cell>
                        <Table.Cell>
                          {patient.created_at ? new Date(patient.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </Table.Cell>
                        <Table.Cell>
                          {patient.updated_at ? new Date(patient.updated_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </Table.Cell>
                        <Table.Cell>
                          <Flex gap="2">
                            <Tooltip content="Edit Patient">
                              <IconButton
                                size="1"
                                variant="ghost"
                                color="blue"
                                onClick={() => handleEditPatient(patient)}
                              >
                                <Pencil size={14} />
                              </IconButton>
                            </Tooltip>
                            <Tooltip content="Delete Patient">
                              <IconButton
                                size="1"
                                variant="ghost"
                                color="red"
                                onClick={() => handleDeletePatient(patient)}
                              >
                                <Trash2 size={14} />
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
            </Box>
      
            {filteredPatients.length > 0 && (
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                itemsPerPage={itemsPerPage}
                totalItems={filteredPatients.length}
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
            )}
      <AddPatientDialog 
        open={isAddPatientDialogOpen} 
        setOpen={setAddPatientDialogOpen}
        onAddPatient={handleAddPatient}
      />
      <EditPatientDialog
        open={isEditPatientDialogOpen}
        setOpen={setEditPatientDialogOpen}
        patient={patientToEdit}
        onUpdatePatient={handleUpdatePatient}
      />
      <ConfirmDialog
        open={isConfirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        title="Delete Patient"
        description={`Are you sure you want to delete patient "${patientToDelete?.name}"? This action cannot be undone.`}
        onConfirm={confirmDelete}
      />
    </Box>
  );
}
