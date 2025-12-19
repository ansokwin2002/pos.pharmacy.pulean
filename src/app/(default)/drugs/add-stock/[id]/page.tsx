'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  Text,
  TextField,
  Callout
} from '@radix-ui/themes';
import { getDrug, updateDrug } from '@/utilities/api/drugs';
import { toast } from 'sonner';
import { Drug } from '@/types/inventory';
import { ArrowLeft } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { usePageTitle } from '@/hooks/usePageTitle';

export default function AddStockPage() {
  const router = useRouter();
  const params = useParams();
  const drugId = params.id as string;

  const [drug, setDrug] = useState<Drug | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    quantity_in_boxes: 0,
    strips_per_box: 0,
    tablets_per_strip: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  usePageTitle(drug ? `Add Stock - ${drug.name}` : 'Add Stock');

  useEffect(() => {
    if (!drugId) return;

    const fetchDrug = async () => {
      setIsLoading(true);
      try {
        const fetchedDrug = await getDrug(drugId);
        setDrug(fetchedDrug);
        setFormData({
          quantity_in_boxes: fetchedDrug.quantity_in_boxes || 0,
          strips_per_box: fetchedDrug.strips_per_box || 0,
          tablets_per_strip: fetchedDrug.tablets_per_strip || 0,
        });
      } catch (error) {
        console.error('Failed to fetch drug:', error);
        setDrug(null);
        toast.error('Failed to load drug details for stock update.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDrug();
  }, [drugId]);

  const handleInputChange = (field: keyof typeof formData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!drug || !validateForm()) {
      return;
    }

    setIsUpdating(true);
    try {
      const dataToSubmit: Partial<Drug> = {
        quantity_in_boxes: formData.quantity_in_boxes,
      };

      if (drug.type_drug !== 'box-only') {
        dataToSubmit.strips_per_box = formData.strips_per_box;
        dataToSubmit.tablets_per_strip = formData.tablets_per_strip;
      } else {
        dataToSubmit.strips_per_box = undefined;
        dataToSubmit.tablets_per_strip = undefined;
      }
      
      await updateDrug(drug.id, dataToSubmit);
      toast.success(`Stock for ${drug.name} updated successfully!`);
      router.push('/drugs'); // Navigate back to drugs list
    } catch (error) {
      console.error('Failed to update stock:', error);
      toast.error('Failed to update stock.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Flex justify="center" align="center" style={{ height: 'calc(100vh - 100px)' }}> {/* Adjust height as needed */}
        <Flex direction="column" align="center" gap="2">
          <Box className="animate-spin" style={{
            width: '32px',
            height: '32px',
            border: '3px solid var(--gray-6)',
            borderTopColor: 'var(--blue-9)',
            borderRadius: '50%'
          }} />
          <Text size="2" color="gray">Loading drug details...</Text>
        </Flex>
      </Flex>
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
      <Flex align="center" justify="between" mb="5">
        <Button variant="ghost" onClick={() => router.push('/drugs')}>
          <ArrowLeft size={16} />
          Back to Drugs
        </Button>
        <Text size="6" weight="bold">Add Stock for {drug.name}</Text>
      </Flex>

      <Card className="p-6">
        <Callout.Root color="blue" size="1" mb="4">
          <Callout.Text>
            Update the stock quantities for {drug.name}. Please enter the current total number of boxes, strips per box, and tablets per strip.
          </Callout.Text>
        </Callout.Root>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4">
            <Grid columns="3" gap="4">
              <Box>
                <Text as="label" size="2" weight="medium" className="block mb-1">
                  Quantity in Stock
                </Text>
                <TextField.Root
                  type="number"
                  min="0"
                  value={formData.quantity_in_boxes.toString()}
                  onChange={(e) => handleInputChange('quantity_in_boxes', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className={errors.quantity_in_boxes ? 'border-red-500' : ''}
                />
                {errors.quantity_in_boxes && (
                  <Text size="1" color="red" className="mt-1">{errors.quantity_in_boxes}</Text>
                )}
              </Box>

              {drug.type_drug !== 'box-only' && (
                <>
                  <Box>
                    <Text as="label" size="2" weight="medium" className="block mb-1">
                      Strips Per Box
                    </Text>
                    <TextField.Root
                      type="number"
                      min="0"
                      value={formData.strips_per_box.toString()}
                      onChange={(e) => handleInputChange('strips_per_box', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className={errors.strips_per_box ? 'border-red-500' : ''}
                    />
                    {errors.strips_per_box && (
                      <Text size="1" color="red" className="mt-1">{errors.strips_per_box}</Text>
                    )}
                  </Box>

                  <Box>
                    <Text as="label" size="2" weight="medium" className="block mb-1">
                      Tablets Per Strip
                    </Text>
                    <TextField.Root
                      type="number"
                      min="0"
                      value={formData.tablets_per_strip.toString()}
                      onChange={(e) => handleInputChange('tablets_per_strip', parseInt(e.target.value) || 0)}
                      placeholder="0"
                      className={errors.tablets_per_strip ? 'border-red-500' : ''}
                    />
                    {errors.tablets_per_strip && (
                      <Text size="1" color="red" className="mt-1">{errors.tablets_per_strip}</Text>
                    )}
                  </Box>
                </>
              )}
            </Grid>

            <Flex gap="3" justify="end" className="mt-6">
              <Button type="button" variant="soft" color="gray" onClick={() => router.push('/drugs')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Update Stock'}
              </Button>
            </Flex>
          </Flex>
        </form>
      </Card>
    </Box>
  );
}
