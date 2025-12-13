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
  TextArea,
  Select,
  Switch,
  Callout // Added Callout import
} from '@radix-ui/themes';
import { Drug } from '@/types/inventory';
import DateInput from '@/components/common/DateInput';

interface DrugFormProps {
  drug?: Drug;
  onSubmit: (drugData: Partial<Drug>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const getInitialData = (drug?: Drug): Partial<Drug> => {
  const defaults = {
    name: '',
    generic_name: '',
    brand_name: '',
    box_price: 0,
    box_cost_price: 0,
    strip_price: 0,
    strip_cost_price: 0,
    tablet_price: 0,
    tablet_cost_price: 0,
    quantity_in_boxes: 0,
    strips_per_box: 0,
    tablets_per_strip: 0,
    expiry_date: new Date(),
    barcode: '',

    status: 'active' as 'active' | 'inactive',
  };

  if (drug) {
    return {
      ...defaults,
      ...drug,
      expiry_date: new Date(drug.expiry_date),
    };
  }

  return defaults;
};

export default function DrugForm({ drug, onSubmit, onCancel, isLoading = false }: DrugFormProps) {
  const [formData, setFormData] = useState<Partial<Drug>>(getInitialData(drug));
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    setFormData(getInitialData(drug));
  }, [drug]);

  const handleInputChange = (field: keyof Drug, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Drug name is required';
    }

    if (!formData.generic_name?.trim()) {
      newErrors.generic_name = 'Generic name is required';
    }

    if (!formData.box_price || formData.box_price <= 0) {
      newErrors.box_price = 'Box price must be greater than 0';
    }
    if (!formData.box_cost_price || formData.box_cost_price <= 0) {
      newErrors.box_cost_price = 'Box cost price must be greater than 0';
    }
    if (!formData.strip_price || formData.strip_price <= 0) {
      newErrors.strip_price = 'Strip price must be greater than 0';
    }
    if (!formData.strip_cost_price || formData.strip_cost_price <= 0) {
      newErrors.strip_cost_price = 'Strip cost price must be greater than 0';
    }
    if (!formData.tablet_price || formData.tablet_price <= 0) {
      newErrors.tablet_price = 'Tablet price must be greater than 0';
    }
    if (!formData.tablet_cost_price || formData.tablet_cost_price <= 0) {
      newErrors.tablet_cost_price = 'Tablet cost price must be greater than 0';
    }
    if (formData.quantity_in_boxes === undefined || formData.quantity_in_boxes < 0) {
      newErrors.quantity_in_boxes = 'Quantity (in boxes) must be 0 or greater';
    }
    if (!formData.strips_per_box || formData.strips_per_box <= 0) {
      newErrors.strips_per_box = 'Strips per box must be greater than 0';
    }
    if (!formData.tablets_per_strip || formData.tablets_per_strip <= 0) {
      newErrors.tablets_per_strip = 'Tablets per strip must be greater than 0';
    }

    if (!formData.expiry_date) {
      newErrors.expiry_date = 'Expiry date is required';
    } else if (formData.expiry_date <= new Date()) {
      newErrors.expiry_date = 'Expiry date must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      const dataToSubmit = { ...formData };
      if (dataToSubmit.expiry_date) {
        dataToSubmit.expiry_date = dataToSubmit.expiry_date.toISOString().split('T')[0] as any; // Format to YYYY-MM-DD string
      }
      onSubmit(dataToSubmit);
    }
  };

  const unitOptions = [
    { value: 'tablets', label: 'Tablets' },
    { value: 'capsules', label: 'Capsules' },
    { value: 'ml', label: 'Milliliters (ml)' },
    { value: 'mg', label: 'Milligrams (mg)' },
    { value: 'g', label: 'Grams (g)' },
    { value: 'bottles', label: 'Bottles' },
    { value: 'vials', label: 'Vials' },
    { value: 'tubes', label: 'Tubes' },
    { value: 'boxes', label: 'Boxes' },
    { value: 'units', label: 'Units' }
  ];

  return (
    <Card className="p-6">
      <Callout.Root color="blue" size="1" mb="4">
        <Callout.Text>
          Please provide comprehensive details for the new drug. Ensure all required fields, marked with an asterisk (*), are accurately completed to maintain precise pharmaceutical inventory records.
        </Callout.Text>
      </Callout.Root>
      <form onSubmit={handleSubmit}>
        <Flex direction="column" gap="4">
          <Grid columns="2" gap="4">
            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Drug Name *
              </Text>
              <TextField.Root
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter drug name"
                className={errors.name ? 'border-red-500' : ''}
              />
              {errors.name && (
                <Text size="1" color="red" className="mt-1">{errors.name}</Text>
              )}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Generic Name *
              </Text>
              <TextField.Root
                value={formData.generic_name || ''}
                onChange={(e) => handleInputChange('generic_name', e.target.value)}
                placeholder="Enter generic name"
                className={errors.generic_name ? 'border-red-500' : ''}
              />
              {errors.generic_name && (
                <Text size="1" color="red" className="mt-1">{errors.generic_name}</Text>
              )}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Brand Name
              </Text>
              <TextField.Root
                value={formData.brand_name || ''}
                onChange={(e) => handleInputChange('brand_name', e.target.value)}
                placeholder="Enter brand name (optional)"
              />
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Barcode
              </Text>
              <TextField.Root
                value={formData.barcode || ''}
                onChange={(e) => handleInputChange('barcode', e.target.value)}
                placeholder="Enter barcode"
              />
            </Box>

          </Grid>

          <Grid columns="3" gap="4" mt="4">
            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Quantity in Boxes *
              </Text>
              <TextField.Root
                type="number"
                min="0"
                value={formData.quantity_in_boxes?.toString() || ''}
                onChange={(e) => handleInputChange('quantity_in_boxes', parseInt(e.target.value) || 0)}
                placeholder="0"
                className={errors.quantity_in_boxes ? 'border-red-500' : ''}
              />
              {errors.quantity_in_boxes && (
                <Text size="1" color="red" className="mt-1">{errors.quantity_in_boxes}</Text>
              )}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Box Price *
              </Text>
              <TextField.Root
                type="number"
                step="0.01"
                min="0"
                value={formData.box_price?.toString() || ''}
                onChange={(e) => handleInputChange('box_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.box_price ? 'border-red-500' : ''}
              />
              {errors.box_price && (
                <Text size="1" color="red" className="mt-1">{errors.box_price}</Text>
              )}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Box Cost Price *
              </Text>
              <TextField.Root
                type="number"
                step="0.01"
                min="0"
                value={formData.box_cost_price?.toString() || ''}
                onChange={(e) => handleInputChange('box_cost_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.box_cost_price ? 'border-red-500' : ''}
              />
              {errors.box_cost_price && (
                <Text size="1" color="red" className="mt-1">{errors.box_cost_price}</Text>
              )}
            </Box>
          </Grid>

          <Grid columns="3" gap="4" mt="4">
            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Strips Per Box *
              </Text>
              <TextField.Root
                type="number"
                min="1"
                value={formData.strips_per_box?.toString() || ''}
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
                Strip Price *
              </Text>
              <TextField.Root
                type="number"
                step="0.01"
                min="0"
                value={formData.strip_price?.toString() || ''}
                onChange={(e) => handleInputChange('strip_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.strip_price ? 'border-red-500' : ''}
              />
              {errors.strip_price && (
                <Text size="1" color="red" className="mt-1">{errors.strip_price}</Text>
              )}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Strip Cost Price *
              </Text>
              <TextField.Root
                type="number"
                step="0.01"
                min="0"
                value={formData.strip_cost_price?.toString() || ''}
                onChange={(e) => handleInputChange('strip_cost_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.strip_cost_price ? 'border-red-500' : ''}
              />
              {errors.strip_cost_price && (
                <Text size="1" color="red" className="mt-1">{errors.strip_cost_price}</Text>
              )}
            </Box>
          </Grid>

          <Grid columns="3" gap="4" mt="4">
            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Tablets Per Strip *
              </Text>
              <TextField.Root
                type="number"
                min="1"
                value={formData.tablets_per_strip?.toString() || ''}
                onChange={(e) => handleInputChange('tablets_per_strip', parseInt(e.target.value) || 0)}
                placeholder="0"
                className={errors.tablets_per_strip ? 'border-red-500' : ''}
              />
              {errors.tablets_per_strip && (
                <Text size="1" color="red" className="mt-1">{errors.tablets_per_strip}</Text>
              )}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Tablet Price *
              </Text>
              <TextField.Root
                type="number"
                step="0.01"
                min="0"
                value={formData.tablet_price?.toString() || ''}
                onChange={(e) => handleInputChange('tablet_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.tablet_price ? 'border-red-500' : ''}
              />
              {errors.tablet_price && (
                <Text size="1" color="red" className="mt-1">{errors.tablet_price}</Text>
              )}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Tablet Cost Price *
              </Text>
              <TextField.Root
                type="number"
                step="0.01"
                min="0"
                value={formData.tablet_cost_price?.toString() || ''}
                onChange={(e) => handleInputChange('tablet_cost_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.tablet_cost_price ? 'border-red-500' : ''}
              />
              {errors.tablet_cost_price && (
                <Text size="1" color="red" className="mt-1">{errors.tablet_cost_price}</Text>
              )}
            </Box>
          </Grid>

          <Grid columns="2" gap="4" mt="4">
            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Expiry Date *
              </Text>
              <DateInput
                value={formData.expiry_date}
                onChange={(date) => handleInputChange('expiry_date', date)}
              />
              {errors.expiry_date && (
                <Text size="1" color="red" className="mt-1">{errors.expiry_date}</Text>
              )}
            </Box>
          </Grid>

          <Box mt="4">
            <Flex align="center" gap="2">
              <Switch
                checked={formData.status === 'active'}
                onCheckedChange={(checked) => handleInputChange('status', checked ? 'active' : 'inactive')}
              />
              <Text size="2" weight="medium">Active</Text>
            </Flex>
          </Box>

          <Flex gap="3" justify="end" className="mt-6">
            <Button type="button" variant="soft" color="gray" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : (drug ? 'Update Drug' : 'Add Drug')}
            </Button>
          </Flex>
        </Flex>
      </form>
    </Card>
  );
}