'use client';
import { useState, useEffect } from 'react';
import { Box, Flex, Table, Button, TextField, Dialog, Text, Select, IconButton } from "@radix-ui/themes";
import { faker } from '@faker-js/faker';
import { PageHeading } from '@/components/common/PageHeading';
import { Search, Plus, RotateCcw, Pencil, Trash2 } from 'lucide-react';
import { SortableHeader } from '@/components/common/SortableHeader';
import Pagination from '@/components/common/Pagination';
import { toast } from 'sonner';
import ConfirmDialog from '@/components/common/ConfirmDialog';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  gender: 'male' | 'female';
}

const generateFakePatients = (count: number): Patient[] => {
  const patients: Patient[] = [];
  for (let i = 0; i < count; i++) {
    const gender = faker.person.sex() as 'male' | 'female';
    patients.push({
      id: faker.string.uuid(),
      name: faker.person.fullName({ sex: gender }),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      address: faker.location.streetAddress(),
      city: faker.location.city(),
      gender: gender,
    });
  }
  return patients;
};

const AddPatientDialog = ({ open, setOpen, onAddPatient }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');


  const handleSubmit = () => {
    if (!name) {
      toast.error('Patient name is required.');
      return;
    }
    const newPatient: Patient = {
      id: faker.string.uuid(),
      name,
      email,
      phone,
      address,
      city,
      gender,
    };
    onAddPatient(newPatient);
    setOpen(false);
    setName('');
    setEmail('');
    setPhone('');
    setAddress('');
    setCity('');
    setGender('male');
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
              placeholder="Enter full name"
              required
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Email
            </Text>
            <TextField.Root
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Phone
            </Text>
            <TextField.Root
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
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
              City
            </Text>
            <TextField.Root
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
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
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  useEffect(() => {
    if (patient) {
      setName(patient.name);
      setEmail(patient.email);
      setPhone(patient.phone);
      setAddress(patient.address);
      setCity(patient.city);
      setGender(patient.gender);
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
      email,
      phone,
      address,
      city,
      gender,
    };
    onUpdatePatient(updatedPatient);
    setOpen(false);
    toast.success('Patient updated successfully!');
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Content style={{ maxWidth: 450 }}>
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
              Email
            </Text>
            <TextField.Root
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
            />
          </label>
          <label>
            <Text as="div" size="2" mb="1" weight="bold">
              Phone
            </Text>
            <TextField.Root
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Enter phone number"
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
              City
            </Text>
            <TextField.Root
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Enter city"
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
  const [cityFilter, setCityFilter] = useState('all');
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Patient; direction: 'asc' | 'desc' } | null>(null);
  const [isAddPatientDialogOpen, setAddPatientDialogOpen] = useState(false);
  const [isEditPatientDialogOpen, setEditPatientDialogOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isConfirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);

  useEffect(() => {
    setPatientsData(generateFakePatients(30));
  }, []);

  const cities = [...new Set(patientsData.map(p => p.city).filter(Boolean))];

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
    let filtered = sortedPatients.filter(patient =>
      patient.name.toLowerCase().includes(lowercasedFilter)
    );

    if (genderFilter !== 'all') {
      filtered = filtered.filter(patient => patient.gender === genderFilter);
    }

    if (cityFilter !== 'all') {
      filtered = filtered.filter(patient => patient.city === cityFilter);
    }

    setFilteredPatients(filtered);
    setCurrentPage(1);
  }, [searchTerm, sortConfig, patientsData, genderFilter, cityFilter]);

  const handleSort = (key: keyof Patient) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleAddPatient = (newPatient: Patient) => {
    setPatientsData(prev => [newPatient, ...prev]);
  };

  const handleEditPatient = (patient: Patient) => {
    setPatientToEdit(patient);
    setEditPatientDialogOpen(true);
  };

  const handleUpdatePatient = (updatedPatient: Patient) => {
    setPatientsData(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
    setConfirmDialogOpen(true);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
      setPatientsData(prev => prev.filter(p => p.id !== patientToDelete.id));
      toast.success(`Patient "${patientToDelete.name}" deleted successfully.`);
      setPatientToDelete(null);
    }
    setConfirmDialogOpen(false);
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setGenderFilter('all');
    setCityFilter('all');
  };

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, filteredPatients.length);
  const currentItems = filteredPatients.slice(startIndex, endIndex);

  return (
    <Box className="space-y-4">
      <Flex justify="between" align="start" mb="5">
        <PageHeading title="Patient List" description="View and manage all patients" />
        <Button onClick={() => setAddPatientDialogOpen(true)}>
          <Plus size={16} /> Add Patient
        </Button>
      </Flex>

      <Box>
        <Flex gap="4" align="center" wrap="wrap">
          <Box className="flex-grow min-w-[250px]">
            <TextField.Root
              placeholder="Search by name..."
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
          <Flex align="center" gap="2" className="flex-shrink-0">
            <Select.Root value={cityFilter} onValueChange={setCityFilter}>
              <Select.Trigger placeholder="All Cities" />
              <Select.Content>
                <Select.Item value="all">All Cities</Select.Item>
                {cities.map(city => (
                  <Select.Item key={city} value={city}>{city}</Select.Item>
                ))}
              </Select.Content>
            </Select.Root>
          </Flex>
          <Button variant="soft" color={genderFilter !== 'all' || cityFilter !== 'all' ? 'red' : 'gray'} onClick={handleResetFilters}>
            <RotateCcw size={16} />
            Reset Filters
          </Button>
        </Flex>
      </Box>

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
                label="Name"
                sortKey="name"
                currentSort={sortConfig}
                onSort={handleSort}
              />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <SortableHeader
                label="Email"
                sortKey="email"
                currentSort={sortConfig}
                onSort={handleSort}
              />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <SortableHeader
                label="Phone"
                sortKey="phone"
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
                label="City"
                sortKey="city"
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
            <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {currentItems.map((patient) => (
            <Table.Row key={patient.id}>
              <Table.Cell>{patient.id.substring(0,8)}</Table.Cell>
              <Table.RowHeaderCell>{patient.name}</Table.RowHeaderCell>
              <Table.Cell>{patient.email}</Table.Cell>
              <Table.Cell>{patient.phone}</Table.Cell>
              <Table.Cell>{patient.address}</Table.Cell>
              <Table.Cell>{patient.city}</Table.Cell>
              <Table.Cell>{patient.gender}</Table.Cell>
              <Table.Cell>
                <Flex gap="3">
                  <IconButton size="1" variant="outline" color="gray" onClick={() => handleEditPatient(patient)}>
                    <Pencil size={14} />
                  </IconButton>
                  <IconButton size="1" variant="soft" color="red" onClick={() => handleDeletePatient(patient)}>
                    <Trash2 size={14} />
                  </IconButton>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>

      {filteredPatients.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredPatients.length}
          startIndex={startIndex}
          endIndex={endIndex}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
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