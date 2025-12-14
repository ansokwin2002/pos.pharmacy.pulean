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
    strips_per_box: undefined, // Initialize as undefined
    tablets_per_strip: undefined, // Initialize as undefined
    expiry_date: new Date(),
    barcode: '',
    type_drug: 'box-strip-tablet', // Default to 'box-strip-tablet'

    status: 'active' as 'active' | 'inactive',
  };

  if (drug) {
    return {
      ...defaults,
      ...drug,
      expiry_date: new Date(drug.expiry_date),
      strips_per_box: drug.strips_per_box ?? undefined, // Ensure it's undefined if null/0 from backend
      tablets_per_strip: drug.tablets_per_strip ?? undefined,
      type_drug: drug.type_drug || 'box-strip-tablet', // Ensure type_drug is set
    };
  }

  return defaults;
};

export default function DrugForm({ drug, onSubmit, onCancel, isLoading = false }: DrugFormProps) {
  const [formData, setFormData] = useState<Partial<Drug>>(getInitialData(drug));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [medicineTypeDisplay, setMedicineTypeDisplay] = useState<'box-strip-tablet' | 'box-only'>(
    drug && (drug.strips_per_box === undefined || drug.strips_per_box === 0) && (drug.tablets_per_strip === undefined || drug.tablets_per_strip === 0)
      ? 'box-only'
      : 'box-strip-tablet'
  );

  useEffect(() => {
    setFormData(getInitialData(drug));
    setMedicineTypeDisplay(
      drug && drug.type_drug === 'box-only'
        ? 'box-only'
        : 'box-strip-tablet'
    );
  }, [drug]);

  const handleInputChange = (field: keyof Drug, value: any) => {
    let newValue = value;
    if (field === 'strips_per_box' || field === 'tablets_per_strip' || field === 'quantity_in_boxes') {
      newValue = value === '' ? undefined : parseInt(value) || 0;
    } else if (field === 'box_price' || field === 'box_cost_price' || field === 'strip_price' || field === 'strip_cost_price' || field === 'tablet_price' || field === 'tablet_cost_price') {
      newValue = value === '' ? undefined : parseFloat(value) || 0;
    }


    setFormData(prev => ({
      ...prev,
      [field]: newValue
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

    if (medicineTypeDisplay === 'box-strip-tablet') {
      if (formData.strips_per_box === undefined || formData.strips_per_box <= 0) {
        newErrors.strips_per_box = 'Strips per box is required and must be greater than 0';
      }
      if (formData.strip_price === undefined || formData.strip_price <= 0) {
        newErrors.strip_price = 'Strip price is required and must be greater than 0';
      }
      if (formData.strip_cost_price === undefined || formData.strip_cost_price <= 0) {
        newErrors.strip_cost_price = 'Strip cost price is required and must be greater than 0';
      }
      if (formData.tablets_per_strip === undefined || formData.tablets_per_strip <= 0) {
        newErrors.tablets_per_strip = 'Tablets per strip is required and must be greater than 0';
      }
      if (formData.tablet_price === undefined || formData.tablet_price <= 0) {
        newErrors.tablet_price = 'Tablet price is required and must be greater than 0';
      }
      if (formData.tablet_cost_price === undefined || formData.tablet_cost_price <= 0) {
        newErrors.tablet_cost_price = 'Tablet cost price is required and must be greater than 0';
      }
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
      const dataToSubmit: Partial<Drug> = { ...formData };
      dataToSubmit.type_drug = medicineTypeDisplay; // Set type_drug based on selected display option
      
      // If medicineTypeDisplay is 'box-only', clear strip and tablet related fields
      if (medicineTypeDisplay === 'box-only') {
        dataToSubmit.strips_per_box = undefined;
        dataToSubmit.tablets_per_strip = undefined;
        dataToSubmit.strip_price = undefined;
        dataToSubmit.strip_cost_price = undefined;
        dataToSubmit.tablet_price = undefined;
        dataToSubmit.tablet_cost_price = undefined;
      }
      
      // Calculate total quantity (total tablets)
      const quantityInBoxes = dataToSubmit.quantity_in_boxes || 0;
      const stripsPerBox = dataToSubmit.strips_per_box || 0;
      const tabletsPerStrip = dataToSubmit.tablets_per_strip || 0;
      
      // The logic for total tablets depends on what's available.
      // If we have strips and tablets per strip, we can calculate total from boxes.
      if (stripsPerBox > 0 && tabletsPerStrip > 0) {
        dataToSubmit.quantity = quantityInBoxes * stripsPerBox * tabletsPerStrip;
      } else if (stripsPerBox > 0) {
        // Case where we only have strips per box
        dataToSubmit.quantity = quantityInBoxes * stripsPerBox;
      } else {
        // Fallback to just quantity in boxes if other units are not defined
        dataToSubmit.quantity = quantityInBoxes;
      }

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
          <Grid columns="3" gap="4">
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
            <Box>
              <Text as="label" size="2" weight="medium" className="block mb-1">
                Medicine Type Display *
              </Text>
              <Select.Root
                value={medicineTypeDisplay}
                onValueChange={(value) => setMedicineTypeDisplay(value as 'box-strip-tablet' | 'box-only')}
              >
                <Select.Trigger placeholder="Select medicine type" className="w-full" />
                <Select.Content>
                  <Select.Item value="box-strip-tablet">Box/Strip/Tablet</Select.Item>
                  <Select.Item value="box-only">Box Only</Select.Item>
                </Select.Content>
              </Select.Root>
            </Box>
          </Grid>

          {/* Conditional Rendering based on medicineTypeDisplay */}
          {medicineTypeDisplay === 'box-strip-tablet' || medicineTypeDisplay === 'box-only' ? (
            <Grid columns="3" gap="4" mt="4">
              <Box>
                <Text as="label" size="2" weight="medium" className="block mb-1">
                  Quantity in Boxes
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
                  Box Price
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
                  Box Cost Price
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
          ) : null}

          {medicineTypeDisplay === 'box-strip-tablet' ? (
            <>
              <Grid columns="3" gap="4" mt="4">
                <Box>
                  <Text as="label" size="2" weight="medium" className="block mb-1">
                    Strips Per Box
                  </Text>
                  <TextField.Root
                    type="number"
                    value={formData.strips_per_box?.toString() ?? ''}
                    onChange={(e) => handleInputChange('strips_per_box', e.target.value)}
                    placeholder="0"
                    className={errors.strips_per_box ? 'border-red-500' : ''}
                  />
                  {errors.strips_per_box && (
                    <Text size="1" color="red" className="mt-1">{errors.strips_per_box}</Text>
                  )}
                </Box>

                <Box>
                  <Text as="label" size="2" weight="medium" className="block mb-1">
                    Strip Price
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
                    Strip Cost Price
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
                    Tablets Per Strip
                  </Text>
                  <TextField.Root
                    type="number"
                    value={formData.tablets_per_strip?.toString() ?? ''}
                    onChange={(e) => handleInputChange('tablets_per_strip', e.target.value)}
                    placeholder="0"
                    className={errors.tablets_per_strip ? 'border-red-500' : ''}
                  />
                  {errors.tablets_per_strip && (
                    <Text size="1" color="red" className="mt-1">{errors.tablets_per_strip}</Text>
                  )}
                </Box>

                <Box>
                  <Text as="label" size="2" weight="medium" className="block mb-1">
                    Tablet Price
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
                    Tablet Cost Price
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
            </>
          ) : null}

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