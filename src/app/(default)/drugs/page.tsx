'use client';

import React, { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Callout,
  Flex,
  TextField,
  Select,
  Dialog,
  AlertDialog
} from '@radix-ui/themes';
import { mockDrugs } from '@/data/DrugData';
import { Drug } from '@/types/inventory';
import DrugsTable from '@/components/drugs/DrugsTable';
import DrugForm from '@/components/drugs/DrugForm';
import Pagination from '@/components/common/Pagination';
import { Plus, Search, RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { PageHeading } from '@/components/common/PageHeading';
import { usePageTitle } from '@/hooks/usePageTitle';

const ITEMS_PER_PAGE = 10;

export default function DrugsPage() {
  usePageTitle('Drugs');
  const [drugs] = useState<Drug[]>(mockDrugs);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(ITEMS_PER_PAGE);
  const [filteredDrugs, setFilteredDrugs] = useState<Drug[]>(drugs);
  const router = useRouter();
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in-stock' | 'low-stock' | 'out-of-stock'>('all');
  
  // Dialog states
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<Drug | null>(null);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setStockFilter('all');
  };

  // Filter drugs when filters change
  useEffect(() => {
    let filtered = drugs;
    
    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(drug => 
        drug.name.toLowerCase().includes(term) || 
        drug.generic_name.toLowerCase().includes(term) ||
        (drug.brand_name && drug.brand_name.toLowerCase().includes(term)) ||
        (drug.barcode && drug.barcode.toLowerCase().includes(term)) ||
        (drug.manufacturer && drug.manufacturer.toLowerCase().includes(term))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(drug => drug.status === statusFilter);
    }
    
    // Apply stock filter
    if (stockFilter !== 'all') {
      filtered = filtered.filter(drug => {
        switch (stockFilter) {
          case 'out-of-stock':
            return drug.quantity === 0;
          case 'low-stock':
            return drug.quantity > 0 && drug.quantity < 50;
          case 'in-stock':
            return drug.quantity >= 50;
          default:
            return true;
        }
      });
    }
    
    setFilteredDrugs(filtered);
    setCurrentPage(1);
  }, [drugs, searchTerm, statusFilter, stockFilter]);

  const totalPages = Math.ceil(filteredDrugs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedDrugs = filteredDrugs.slice(startIndex, endIndex);

  const handleAddDrug = (drugData: Partial<Drug>) => {
    console.log('Adding drug:', drugData);
    // Here you would typically make an API call to add the drug
    setIsAddDialogOpen(false);
  };

  const handleEditDrug = (drug: Drug) => {
    setSelectedDrug(drug);
    setIsEditDialogOpen(true);
  };

  const handleUpdateDrug = (drugData: Partial<Drug>) => {
    console.log('Updating drug:', drugData);
    // Here you would typically make an API call to update the drug
    setIsEditDialogOpen(false);
    setSelectedDrug(null);
  };

  const handleDeleteDrug = (drug: Drug) => {
    setSelectedDrug(drug);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDrug = () => {
    console.log('Deleting drug:', selectedDrug);
    // Here you would typically make an API call to delete the drug
    // For now, we'll just close the dialog
    setIsDeleteDialogOpen(false);
    setSelectedDrug(null);
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
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus size={16} />
          Add Drug
        </Button>
      </Flex>
      
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
        onEdit={handleEditDrug}
        onDelete={handleDeleteDrug}
        onView={handleViewDrug}
      />

      {filteredDrugs.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          totalItems={filteredDrugs.length}
          startIndex={startIndex + 1}
          endIndex={Math.min(endIndex, filteredDrugs.length)}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(newSize) => {
            setItemsPerPage(newSize);
            setCurrentPage(1);
          }}
        />
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
          <DrugForm
            drug={selectedDrug || undefined}
            onSubmit={handleUpdateDrug}
            onCancel={() => {
              setIsEditDialogOpen(false);
              setSelectedDrug(null);
            }}
          />
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
            <AlertDialog.Cancel asChild>
              <Button variant="soft" color="gray">
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button variant="solid" color="red" onClick={confirmDeleteDrug}>
                Delete Drug
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  );
}
