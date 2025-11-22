'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Callout,
  Flex,
  TextField,
  Select,
  Dialog,
  AlertDialog,
  Text as RadixText
} from '@radix-ui/themes';
import { Drug } from '@/types/inventory';
import DrugsTable from '@/components/drugs/DrugsTable';
import DrugForm from '@/components/drugs/DrugForm';
import Pagination from '@/components/common/Pagination';
import { Plus, Search, RefreshCcw, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeading } from '@/components/common/PageHeading';
import { usePageTitle } from '@/hooks/usePageTitle';
import { listDrugs, createDrug, updateDrug, deleteDrug, getDrug } from '@/utilities/api/drugs';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

export default function DrugsPage() {
  usePageTitle('Drugs');
  const [drugsData, setDrugsData] = useState<Drug[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [totalDrugs, setTotalDrugs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);
  const [isFetchingSingleDrug, setIsFetchingSingleDrug] = useState(false);

  const handleEditDrug = async (drug: Drug) => {
    setSelectedDrug(drug); // Set immediately for optimistic UI or to show old data
    setIsEditDialogOpen(true);
    setIsFetchingSingleDrug(true);
    try {
      const fetchedDrug = await getDrug(drug.id);
      setSelectedDrug({
        ...fetchedDrug,
        expiry_date: new Date(fetchedDrug.expiry_date),
        created_at: fetchedDrug.created_at ? new Date(fetchedDrug.created_at) : undefined,
        updated_at: fetchedDrug.updated_at ? new Date(fetchedDrug.updated_at) : undefined,
      });
    } catch (err: any) {
      console.error('Failed to fetch single drug:', err);
      toast.error(err.detail?.message || err.message || 'Failed to fetch drug details');
      setIsEditDialogOpen(false); // Close dialog if fetch fails
    } finally {
      setIsFetchingSingleDrug(false);
    }
  };

  const handleSelectionChange = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === drugsData.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(drugsData.map(d => d.id));
    }
  };

  const [isDeleteSelectedDialogOpen, setIsDeleteSelectedDialogOpen] = useState(false);

  const handleDeleteSelected = () => {
    setIsDeleteSelectedDialogOpen(true);
  };

  const confirmDeleteSelected = async () => {
    const originalDrugs = [...drugsData];
    
    // Optimistic UI update
    setDrugsData(prev => prev.filter(d => !selectedIds.includes(d.id)));
    setIsDeleteSelectedDialogOpen(false);

    try {
      await Promise.all(selectedIds.map(id => deleteDrug(id)));
      toast.success(`${selectedIds.length} drugs deleted successfully!`);
      setSelectedIds([]);
    } catch (err: any) {
      console.error('Failed to delete selected drugs:', err);
      toast.error('Failed to delete one or more drugs.');
      // Rollback on failure
      setDrugsData(originalDrugs);
    }
  };

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStockFilter('all');
    setCurrentPage(1); // Reset to first page on filter reset
  };

  // Fetch drugs when filters or pagination change
  useEffect(() => {
    const fetchDrugs = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const params: any = {
          page: currentPage,
          per_page: itemsPerPage,
          sort_by: 'created_at',
          sort_dir: 'desc',
        };

        if (searchTerm) params.search = searchTerm;
        if (statusFilter !== 'all') params.status = statusFilter;
        if (stockFilter === 'in-stock') params.in_stock = true;
        // The backend API doesn't directly support 'low-stock' or 'out-of-stock' as filters.
        // This would require backend changes or client-side filtering after fetching all.
        // For now, we'll only pass 'in_stock' if selected.

        const response = await listDrugs(params);
        // Assuming the API returns a structure like { data: Drug[], total: number, current_page: number, per_page: number }
        const drugs = response.data.map((drug: any) => ({
          ...drug,
          expiry_date: new Date(drug.expiry_date),
          created_at: drug.created_at ? new Date(drug.created_at) : undefined,
          updated_at: drug.updated_at ? new Date(drug.updated_at) : undefined,
        }));
        setDrugsData(drugs);
        setTotalDrugs(response.total);
      } catch (err: any) {
        console.error('Failed to fetch drugs:', err);
        setError(err.message || 'Failed to fetch drugs');
        toast.error(err.detail?.message || err.message || 'Failed to fetch drugs');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrugs();
  }, [currentPage, itemsPerPage, searchTerm, statusFilter, stockFilter]);

  const totalPages = Math.ceil(totalDrugs / itemsPerPage);
  const paginatedDrugs = drugsData; // drugsData is already paginated by the API


  const handleAddDrug = async (drugData: Partial<Drug>) => {
    // Create a temporary drug object for optimistic update
    const tempId = `temp-${Date.now()}`;
    const newDrug: Drug = {
      ...drugData,
      id: tempId,
      created_at: new Date(),
      updated_at: new Date(),
      // Ensure all required fields are present, even if partial
      name: drugData.name || 'Unnamed Drug',
      generic_name: drugData.generic_name || '',
      unit: drugData.unit || 'units',
      price: drugData.price || 0,
      cost_price: drugData.cost_price || 0,
      quantity: drugData.quantity || 0,
      expiry_date: drugData.expiry_date ? new Date(drugData.expiry_date as any) : new Date(),
      status: drugData.status || 'active',
      slug: drugData.name ? drugData.name.toLowerCase().replace(/ /g, '-') : '',
    };

    // Optimistically add to the UI
    setDrugsData(prev => [newDrug, ...prev]);
    setTotalDrugs(prev => prev + 1);
    setIsAddDialogOpen(false);

    try {
      const savedDrug = await createDrug(drugData as any);
      // Replace the temporary drug with the real one from the server
      setDrugsData(prev => prev.map(d => d.id === tempId ? { ...savedDrug, expiry_date: new Date(savedDrug.expiry_date) } : d));
      toast.success('Drug added successfully!');
    } catch (err: any) {
      console.error('Failed to add drug:', err);
      toast.error(err.detail?.message || err.message || 'Failed to add drug');
      // Rollback on failure
      setDrugsData(prev => prev.filter(d => d.id !== tempId));
      setTotalDrugs(prev => prev - 1);
    }
  };



  const handleUpdateDrug = async (drugData: Partial<Drug>) => {
    if (!selectedDrug?.id) return;

    const originalDrugs = [...drugsData];
    const updatedDrug = { 
      ...selectedDrug, 
      ...drugData,
      // Ensure expiry_date is a Date object for optimistic update
      expiry_date: drugData.expiry_date ? new Date(drugData.expiry_date as any) : selectedDrug.expiry_date,
    };

    // Optimistically update the UI
    setDrugsData(prev => prev.map(d => d.id === selectedDrug.id ? updatedDrug : d));
    setIsEditDialogOpen(false);
    setSelectedDrug(null);

    try {
      // The drugData sent to the API should still have the string representation of the date
      await updateDrug(selectedDrug.id, drugData as any);
      toast.success('Drug updated successfully!');
    } catch (err: any) {
      console.error('Failed to update drug:', err);
      toast.error(err.detail?.message || err.message || 'Failed to update drug');
      // Rollback on failure
      setDrugsData(originalDrugs);
    }
  };

  const handleDeleteDrug = (drug: Drug) => {
    setSelectedDrug(drug);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDrug = async () => {
    if (!selectedDrug?.id) return;

    const originalDrugs = [...drugsData];
    const drugToDelete = selectedDrug;

    // Optimistically update the UI
    setDrugsData(prev => prev.filter(d => d.id !== drugToDelete.id));
    setTotalDrugs(prev => prev - 1);
    setIsDeleteDialogOpen(false);
    setSelectedDrug(null);

    try {
      await deleteDrug(drugToDelete.id);
      toast.success(`Drug "${drugToDelete.name}" deleted successfully!`);
    } catch (err: any) {
      console.error('Failed to delete drug:', err);
      toast.error(err.detail?.message || err.message || 'Failed to delete drug');
      // Rollback on failure
      setDrugsData(originalDrugs);
      setTotalDrugs(prev => prev + 1);
    }
  };

  const handleViewDrug = (drug: Drug) => {
    console.log('Navigating to drug detail:', drug.id);
    router.push(`/drugs/${drug.id}`);
  };

  return (
    <Box className="space-y-4">      
      <Flex 
        direction={{ initial: "column", sm: "row" }} 
        justify="between" 
        align={{ initial: "stretch", sm: "center" }}
        gap={{ initial: "4", sm: "0" }}
        mb="5"
      >
        <PageHeading title="Drugs" description="Manage your pharmaceutical inventory" noMarginBottom />
        {selectedIds.length > 0 ? (
          <Button color="red" onClick={handleDeleteSelected}>
            <Trash2 size={16} />
            Delete Selected ({selectedIds.length})
          </Button>
        ) : (
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus size={16} />
            Add Drug
          </Button>
        )}
      </Flex>
      
      {isLoading ? (
        <p>Loading drugs...</p>
      ) : error ? (
        <Callout.Root color="red" size="1" mb="4">
          <Callout.Text>{error}</Callout.Text>
        </Callout.Root>
      ) : (
        <>
          <Flex gap="4" align="center" wrap="wrap" mb="4">
            <Box className="flex-grow min-w-[250px]">
              <TextField.Root
                placeholder="Search by name, generic name, brand, barcode, or manufacturer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              >
                <TextField.Slot>
                  <Search size={16} />
                </TextField.Slot>
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

              <Select.Root value={stockFilter} onValueChange={(value: 'all' | 'in-stock' | 'low-stock' | 'out-of-stock') => setStockFilter(value)}>
                <Select.Trigger placeholder="All Stock" />
                <Select.Content>
                  <Select.Item value="all">All Stock</Select.Item>
                  <Select.Item value="in-stock">In Stock</Select.Item>
                  <Select.Item value="low-stock">Low Stock</Select.Item>
                  <Select.Item value="out-of-stock">Out of Stock</Select.Item>
                </Select.Content>
              </Select.Root>
            </Flex>

            <Button
              variant="soft"
              color={(statusFilter !== 'all' || stockFilter !== 'all' || searchTerm !== '') ? 'red' : 'gray'}
              onClick={handleResetFilters}
              className="flex-shrink-0"
              disabled={(statusFilter === 'all' && stockFilter === 'all' && searchTerm === '')}
            >
              <RefreshCcw size={16} />
              Reset Filters
            </Button>
          </Flex>

          <Callout.Root color="blue" size="1" mb="4">
            <Callout.Text>
              Manage your pharmaceutical inventory. Track drug quantities, expiry dates, and maintain accurate records.
            </Callout.Text>
          </Callout.Root>

                <DrugsTable
                  drugs={paginatedDrugs}
                  selectedIds={selectedIds}
                  onEdit={handleEditDrug}
                  onDelete={handleDeleteDrug}
                  onView={handleViewDrug}
                  onSelectionChange={handleSelectionChange}
                  onSelectAll={handleSelectAll}
                />
          {totalDrugs > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              totalItems={totalDrugs}
              startIndex={(currentPage - 1) * itemsPerPage + 1}
              endIndex={Math.min(currentPage * itemsPerPage, totalDrugs)}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(newSize) => {
                setItemsPerPage(newSize);
                setCurrentPage(1);
              }}
            />
          )}
        </>
      )}

      {/* Add Drug Dialog */}
      <Dialog.Root open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <Dialog.Content style={{ maxWidth: 800 }}>
          <Dialog.Title>Add New Drug</Dialog.Title>
          <DrugForm
            onSubmit={handleAddDrug}
            onCancel={() => setIsAddDialogOpen(false)}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* Edit Drug Dialog */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Content style={{ maxWidth: 800 }}>
          <Dialog.Title>Edit Drug</Dialog.Title>
          {isFetchingSingleDrug ? (
            <Flex justify="center" align="center" style={{ height: '200px' }}>
              <RadixText size="4" color="gray">Loading drug details...</RadixText>
            </Flex>
          ) : (
            <DrugForm
              drug={selectedDrug || undefined}
              onSubmit={handleUpdateDrug}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setSelectedDrug(null);
              }}
            />
          )}
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialog.Content style={{ maxWidth: 450 }}>
          <AlertDialog.Title>Delete Drug</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure you want to delete <strong>{selectedDrug?.name}</strong>? This action cannot be undone and will permanently remove the drug from your inventory.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button asChild variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button asChild variant="solid" color="red" onClick={confirmDeleteDrug}>
                Delete Drug
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>

      {/* Delete Selected Confirmation Dialog */}
      <AlertDialog.Root open={isDeleteSelectedDialogOpen} onOpenChange={setIsDeleteSelectedDialogOpen}>
        <AlertDialog.Content style={{ maxWidth: 450 }}>
          <AlertDialog.Title>Delete Selected Drugs</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure you want to delete <strong>{selectedIds.length}</strong> selected drug(s)? This action cannot be undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button asChild variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button asChild variant="solid" color="red" onClick={confirmDeleteSelected}>
                Delete
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}