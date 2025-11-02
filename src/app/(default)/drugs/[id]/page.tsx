'use client';

import React, { useState, useEffect } from 'react';
import {
  Badge,
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Text,
  Separator,
  Dialog,
  AlertDialog
} from '@radix-ui/themes';
import { getDrug, updateDrug, deleteDrug } from '@/utilities/api/drugs';
import { toast } from 'sonner';
import { Drug } from '@/types/inventory';
import DrugForm from '@/components/drugs/DrugForm';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { PageHeading } from '@/components/common/PageHeading';
import { usePageTitle } from '@/hooks/usePageTitle';
import { formatCurrency } from '@/utilities';

export default function DrugDetailPage() {
  const router = useRouter();
  const params = useParams();
  const drugId = params.id as string;
  
  const [drug, setDrug] = useState<Drug | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshToggle, setRefreshToggle] = useState(false); // New state

  usePageTitle(drug ? `${drug.name} - Drug Details` : 'Drug Details');

  useEffect(() => {
    if (!drugId) return;

    const fetchDrug = async () => {
      setIsLoading(true);
      try {
        const fetchedDrug = await getDrug(drugId);
        setDrug({
          ...fetchedDrug,
          expiry_date: new Date(fetchedDrug.expiry_date),
        });
      } catch (error) {
        console.error('Failed to fetch drug:', error);
        setDrug(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrug();
  }, [drugId, refreshToggle]); // Added refreshToggle to dependencies

  const handleUpdateDrug = async (drugData: Partial<Drug>) => {
    if (!drug) return;
    try {
      await updateDrug(drug.id, drugData); // No need to use the returned updatedDrug here
      toast.success('Drug updated successfully!');
      setIsEditDialogOpen(false);
      setRefreshToggle(prev => !prev); // Toggle refreshToggle
    } catch (error) {
      console.error('Failed to update drug:', error);
      toast.error('Failed to update drug');
    }
  };

  const handleDeleteDrug = () => {
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteDrug = async () => {
    if (!drug) return;
    try {
      await deleteDrug(drug.id);
      toast.success('Drug deleted successfully!');
      setIsDeleteDialogOpen(false);
      router.push('/drugs');
    } catch (error) {
      console.error('Failed to delete drug:', error);
      toast.error('Failed to delete drug');
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge color="green" variant="soft" size="2">Active</Badge>
    ) : (
      <Badge color="red" variant="soft" size="2">Inactive</Badge>
    );
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge color="red" variant="soft" size="2">Out of Stock</Badge>;
    } else if (quantity < 50) {
      return <Badge color="orange" variant="soft" size="2">Low Stock</Badge>;
    } else {
      return <Badge color="green" variant="soft" size="2">In Stock</Badge>;
    }
  };

  const formatExpiryDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <Badge color="red" variant="soft" size="2">Expired</Badge>;
    } else if (diffDays <= 30) {
      return <Badge color="orange" variant="soft" size="2">Expires Soon</Badge>;
    } else {
      return <Text size="3">{date.toLocaleDateString()}</Text>;
    }
  };

  if (isLoading) {
    return (
      <Box className="space-y-4">
        <Text>Loading...</Text>
      </Box>
    );
  }

  if (!drug) {
    return (
      <Box className="space-y-4">
        <Flex align="center" gap="3" mb="5">
          <Button variant="ghost" onClick={() => router.push('/drugs')}>
            <ArrowLeft size={16} />
            Back to Drugs
          </Button>
        </Flex>
        <Card className="p-6">
          <Text size="4" color="red">Drug not found</Text>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="space-y-6">
      {/* Header Section */}
      <Box mb="5">
        <Button variant="ghost" onClick={() => router.push('/drugs')} className="mb-8">
          <ArrowLeft size={16} />
          Back to Drugs
        </Button>

        <Flex align="start" justify="between" gap="4" mt="8">
          <Box className="flex-1">
            <Flex align="center" gap="3" mb="2">
              <Text size="6" weight="bold">{drug.name}</Text>
              {getStatusBadge(drug.status)}
            </Flex>
            <Text size="3" color="gray" className="mb-1">{drug.generic_name}</Text>
            {drug.brand_name && (
              <Text size="2" color="gray">Brand: {drug.brand_name}</Text>
            )}
          </Box>

          <Flex gap="3" className="flex-shrink-0">
            <Button onClick={() => setIsEditDialogOpen(true)}>
              <Edit size={16} />
              Edit Drug
            </Button>
            <Button color="red" variant="soft" onClick={handleDeleteDrug}>
              <Trash2 size={16} />
              Delete
            </Button>
          </Flex>
        </Flex>
      </Box>

      {/* Quick Stats Cards */}
      <Grid columns={{ initial: "2", sm: "4" }} gap="4">
        <Card className="p-4">
          <Text size="2" color="gray" className="block mb-1">Price</Text>
          <Text size="4" weight="bold">{formatCurrency(drug.price)}</Text>
        </Card>
        <Card className="p-4">
          <Text size="2" color="gray" className="block mb-1">Stock</Text>
          <Flex align="center" gap="2">
            <Text size="4" weight="bold">{drug.quantity}</Text>
            <Text size="2" color="gray">{drug.unit}</Text>
          </Flex>
          <Box className="mt-1">
            {getStockBadge(drug.quantity)}
          </Box>
        </Card>
        <Card className="p-4">
          <Text size="2" color="gray" className="block mb-1">Cost Price</Text>
          <Text size="4" weight="bold">{formatCurrency(drug.cost_price)}</Text>
        </Card>
        <Card className="p-4">
          <Text size="2" color="gray" className="block mb-1">Expiry</Text>
          <Box>
            {formatExpiryDate(drug.expiry_date)}
          </Box>
        </Card>
      </Grid>

      {/* Detailed Information */}
      <Grid columns={{ initial: "1", lg: "2" }} gap="6">
        {/* Product Details */}
        <Card className="p-6">
          <Text size="4" weight="bold" className="mb-6 block">Product Details</Text>
          <Flex direction="column" gap="6">
            {drug.manufacturer && (
              <Box className="pb-2 border-b border-gray-200 dark:border-gray-700">
                <Text size="2" color="gray" className="block mb-2 uppercase tracking-wide">Manufacturer</Text>
                <Text size="3" weight="medium">{drug.manufacturer}</Text>
              </Box>
            )}
            {drug.barcode && (
              <Box className="pb-2 border-b border-gray-200 dark:border-gray-700">
                <Text size="2" color="gray" className="block mb-2 uppercase tracking-wide">Barcode</Text>
                <Text size="3" className="font-mono bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded border dark:border-gray-600 inline-block">{drug.barcode}</Text>
              </Box>
            )}
            {drug.dosage && (
              <Box className="pb-2">
                <Text size="2" color="gray" className="block mb-2 uppercase tracking-wide">Dosage</Text>
                <Text size="3" weight="medium">{drug.dosage}</Text>
              </Box>
            )}
          </Flex>
        </Card>

        {/* Medical Information */}
        <Card className="p-6">
          <Text size="4" weight="bold" className="mb-6 block">Medical Information</Text>
          <Flex direction="column" gap="6">
            {drug.instructions && (
              <Box className="pb-4 border-b border-gray-200 dark:border-gray-700">
                <Text size="2" color="gray" className="block mb-3 uppercase tracking-wide">Usage Instructions</Text>
                <Text size="3" className="leading-relaxed text-gray-800 dark:text-gray-200">{drug.instructions}</Text>
              </Box>
            )}
            {drug.side_effects && (
              <Box className="pb-2">
                <Text size="2" color="gray" className="block mb-3 uppercase tracking-wide">Side Effects</Text>
                <Text size="3" className="leading-relaxed text-gray-800 dark:text-gray-200">{drug.side_effects}</Text>
              </Box>
            )}
            {!drug.instructions && !drug.side_effects && (
              <Box className="text-center py-8">
                <Text size="3" color="gray" style={{ fontStyle: 'italic' }}>
                  No medical information available
                </Text>
              </Box>
            )}
          </Flex>
        </Card>
      </Grid>



      {/* Edit Drug Dialog */}
      <Dialog.Root open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <Dialog.Content style={{ maxWidth: 800 }}>
          <Dialog.Title>Edit Drug</Dialog.Title>
          <DrugForm
            drug={drug}
            onSubmit={handleUpdateDrug}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </Dialog.Content>
      </Dialog.Root>

      {/* Delete Confirmation Dialog */}
      <AlertDialog.Root open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialog.Content style={{ maxWidth: 450 }}>
          <AlertDialog.Title>Delete Drug</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure you want to delete <strong>{drug?.name}</strong>? This action cannot be undone and will permanently remove the drug from your inventory.
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
