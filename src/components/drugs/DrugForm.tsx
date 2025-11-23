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
  Switch
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
    unit: 'tablets',
    price: 0,
    cost_price: 0,
    quantity: 0,
    expiry_date: new Date(),
    barcode: '',
    manufacturer: '',
    status: 'active' as 'active' | 'inactive',
  };

  if (drug) {
    return {
      ...defaults,
      ...drug,
      unit: drug.unit || 'tablets',
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

    if (!formData.unit?.trim()) {
      newErrors.unit = 'Unit is required';
    }

    if (!formData.price || formData.price <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.cost_price || formData.cost_price <= 0) {
      newErrors.cost_price = 'Cost price must be greater than 0';
    }

    if (formData.quantity === undefined || formData.quantity < 0) {
      newErrors.quantity = 'Quantity must be 0 or greater';
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
                Manufacturer
              </Text>
              <TextField.Root
                value={formData.manufacturer || ''}
                onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                placeholder="Enter manufacturer name"
              />
            </Box>
          </Grid>

          <Grid columns="3" gap="4">
            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Unit *
              </Text>
              <Select.Root
                value={formData.unit || 'tablets'}
                onValueChange={(value) => handleInputChange('unit', value)}
              >
                <Select.Trigger className={errors.unit ? 'border-red-500' : ''} />
                <Select.Content>
                  {unitOptions.map(option => (
                    <Select.Item key={option.value} value={option.value}>
                      {option.label}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              {errors.unit && (
                <Text size="1" color="red" className="mt-1">{errors.unit}</Text>
              )}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Price *
              </Text>
              <TextField.Root
                type="number"
                step="0.01"
                min="0"
                value={formData.price?.toString() || ''}
                onChange={(e) => handleInputChange('price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && (
                <Text size="1" color="red" className="mt-1">{errors.price}</Text>
              )}
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Cost Price *
              </Text>
              <TextField.Root
                type="number"
                step="0.01"
                min="0"
                value={formData.cost_price?.toString() || ''}
                onChange={(e) => handleInputChange('cost_price', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
                className={errors.cost_price ? 'border-red-500' : ''}
              />
              {errors.cost_price && (
                <Text size="1" color="red" className="mt-1">{errors.cost_price}</Text>
              )}
            </Box>
          </Grid>

          <Grid columns="3" gap="4">
            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Quantity *
              </Text>
              <TextField.Root
                type="number"
                min="0"
                value={formData.quantity?.toString() || ''}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 0)}
                placeholder="0"
                className={errors.quantity ? 'border-red-500' : ''}
              />
              {errors.quantity && (
                <Text size="1" color="red" className="mt-1">{errors.quantity}</Text>
              )}
            </Box>

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

          <Box>
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
