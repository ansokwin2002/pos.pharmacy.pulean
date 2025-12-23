'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Flex, TextField, Dialog, AlertDialog, Text, Callout, Select } from '@radix-ui/themes';
import { Plus, Search, RefreshCcw, Trash2 } from 'lucide-react';
import { PageHeading } from '@/components/common/PageHeading';
import { usePageTitle } from '@/hooks/usePageTitle';
import Pagination from '@/components/common/Pagination';
import CompaniesTable from '@/components/companies/CompaniesTable';
import CompanyForm from '@/components/companies/CompanyForm';
import { Company } from '@/types/company';
import { listCompanies, createCompany, updateCompany, deleteCompany } from '@/utilities/api/companies';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export default function CompaniesPage() {
  usePageTitle('Companies');
  const [companiesData, setCompaniesData] = useState<Company[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCompanies, setTotalCompanies] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  
  const [selectedIds, setSelectedIds] = useState<(string | number)[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleteSelectedDialogOpen, setIsDeleteSelectedDialogOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoading(true);
      try {
        const response = await listCompanies({
          search: searchTerm,
          page: currentPage,
          per_page: ITEMS_PER_PAGE,
          status: statusFilter === 'all' ? undefined : statusFilter,
        } as any);
        setCompaniesData(response.data);
        setTotalCompanies(response.total);
      } catch (error) {
        toast.error('Failed to fetch companies.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchCompanies();
  }, [searchTerm, currentPage, statusFilter]);

  const handleAddCompany = async (companyData: Partial<Company>) => {
    try {
      const newCompany = await createCompany(companyData as any);
      setCompaniesData([newCompany, ...companiesData]);
      setTotalCompanies(totalCompanies + 1);
      setIsAddDialogOpen(false);
      toast.success('Company created successfully!');
    } catch (error) {
      toast.error('Failed to create company.');
    }
  };

  const handleEditCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsEditDialogOpen(true);
  };
  
  const handleUpdateCompany = async (companyData: Partial<Company>) => {
    if (!selectedCompany) return;
    try {
      const updatedCompany = await updateCompany(selectedCompany.id, companyData);
      setCompaniesData(companiesData.map(c => c.id === updatedCompany.id ? updatedCompany : c));
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      toast.success('Company updated successfully!');
    } catch (error) {
      toast.error('Failed to update company.');
    }
  };

  const handleDeleteCompany = (company: Company) => {
    setSelectedCompany(company);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteCompany = async () => {
    if (!selectedCompany) return;
    try {
      await deleteCompany(selectedCompany.id);
      setCompaniesData(companiesData.filter(c => c.id !== selectedCompany.id));
      setTotalCompanies(totalCompanies - 1);
      setIsDeleteDialogOpen(false);
      setSelectedCompany(null);
      toast.success('Company deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete company.');
    }
  };
  
  const handleSelectionChange = (id: string | number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === companiesData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(companiesData.map(c => c.id));
    }
  };
  
  const handleDeleteSelected = () => {
    setIsDeleteSelectedDialogOpen(true);
  };
  
  const confirmDeleteSelected = async () => {
    try {
      await Promise.all(selectedIds.map(id => deleteCompany(id)));
      setCompaniesData(companiesData.filter(c => !selectedIds.includes(c.id)));
      setTotalCompanies(totalCompanies - selectedIds.length);
      setSelectedIds([]);
      setIsDeleteSelectedDialogOpen(false);
      toast.success(`${selectedIds.length} companies deleted successfully!`);
    } catch (error) {
      toast.error('Failed to delete selected companies.');
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
  };

  const totalPages = Math.ceil(totalCompanies / ITEMS_PER_PAGE);

  return (
    <Box className="space-y-4">
      <Flex direction={{ initial: "column", sm: "row" }} justify="between" align={{ initial: "stretch", sm: "center" }} gap={{ initial: "4", sm: "0" }} mb="5">
        <PageHeading title="Companies" description="Manage supplier companies" noMarginBottom />
        {selectedIds.length > 0 && (
          <Button color="red" onClick={handleDeleteSelected}>
            <Trash2 size={16} /> Delete Selected ({selectedIds.length})
          </Button>
        )}
      </Flex>
      
      <Flex justify="start" mt="4" mb="4">
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} /> Add Company
        </Button>
      </Flex>

      {isLoading ? (
        <Text>Loading companies...</Text>
      ) : (
        <>
          <Flex gap="4" align="center" wrap="wrap" mb="4">
            <Box className="flex-grow min-w-[250px]">
              <TextField.Root
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              >
                <TextField.Slot><Search size={16} /></TextField.Slot>
              </TextField.Root>
            </Box>
            <Flex align="center" gap="2" className="flex-shrink-0">
              <Select.Root value={statusFilter} onValueChange={(value: 'all' | 'active' | 'inactive') => setStatusFilter(value)}>
                <Select.Trigger placeholder="All Status" />
                <Select.Content>
                  <Select.Item value="all">All Status</Select.Item>
                  <Select.Item value="active">Active</Select.Item>
                  <Select.Item value="inactive">Inactive</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>
            <Button variant="soft" color={statusFilter !== 'all' || searchTerm !== '' ? 'red' : 'gray'} onClick={handleResetFilters} disabled={statusFilter === 'all' && searchTerm === ''}>
              <RefreshCcw size={16} /> Reset Filters
            </Button>
          </Flex>

          {companiesData.length === 0 ? (
            <Callout.Root>
              <Callout.Text>No companies found.</Callout.Text>
            </Callout.Root>
          ) : (
            <CompaniesTable
              companies={companiesData}
              selectedIds={selectedIds}
              onEdit={handleEditCompany}
              onDelete={handleDeleteCompany}
              onSelectionChange={handleSelectionChange}
              onSelectAll={handleSelectAll}
            />
          )}

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={ITEMS_PER_PAGE}
              totalItems={totalCompanies}
              startIndex={(currentPage - 1) * ITEMS_PER_PAGE + 1}
              endIndex={Math.min(currentPage * ITEMS_PER_PAGE, totalCompanies)}
              onItemsPerPageChange={() => {}}
            />
          )}
        </>
      )}

      {/* Add Company Dialog */}
      <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Add New Company</Dialog.Title>
          <CompanyForm onSubmit={handleAddCompany} onCancel={() => setIsAddDialogOpen(false)} />
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit Company Dialog */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Content style={{ maxWidth: 450 }}>
          <Dialog.Title>Edit Company</Dialog.Title>
          <CompanyForm company={selectedCompany!} onSubmit={handleUpdateCompany} onCancel={() => setIsEditDialogOpen(false)} />
        </Dialog.Content>
      </Dialog.Root>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialog.Content style={{ maxWidth: 450 }}>
          <AlertDialog.Title>Delete Company</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete "{selectedCompany?.name}"? This action cannot be undone.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel><Button variant="soft" color="gray">Cancel</Button></AlertDialog.Cancel>
            <AlertDialog.Action><Button color="red" onClick={confirmDeleteCompany}>Delete</Button></AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
      
      {/* Delete Selected Confirmation Dialog */}
      <AlertDialog.Root open={isDeleteSelectedDialogOpen} onOpenChange={setIsDeleteSelectedDialogOpen}>
        <AlertDialog.Content style={{ maxWidth: 450 }}>
          <AlertDialog.Title>Delete Selected Companies</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete {selectedIds.length} selected companies? This action cannot be undone.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel><Button variant="soft" color="gray">Cancel</Button></AlertDialog.Cancel>
            <AlertDialog.Action><Button color="red" onClick={confirmDeleteSelected}>Delete</Button></AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}
