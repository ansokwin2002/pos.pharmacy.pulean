'use client';

import React, { useState, useEffect, useMemo } from 'react';
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
import { Company } from '@/types/company';
import { API_BASE } from '@/utilities/constants';

interface DrugFormProps {
  drug?: Drug;
  onSubmit: (drugData: Partial<Drug>) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const getInitialData = (drug?: Drug, companies: Company[] = []): Partial<Drug> => {
  const defaults = {
    name: '',
    generic_name: '',

    company_id: undefined, // Initialize company_id
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
    const initialData = {
      ...defaults,
      ...drug,
      expiry_date: new Date(drug.expiry_date),
      strips_per_box: drug.strips_per_box ?? undefined, // Ensure it's undefined if null/0 from backend
      tablets_per_strip: drug.tablets_per_strip ?? undefined,
      type_drug: drug.type_drug || 'box-strip-tablet', // Ensure type_drug is set
      company_id: drug.company_id ?? undefined, // Populate company_id
    };


    return initialData;
  }

  return defaults;
};

export default function DrugForm({ drug, onSubmit, onCancel, isLoading = false }: DrugFormProps) {
  const [formData, setFormData] = useState<Partial<Drug>>(getInitialData(drug));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [medicineTypeDisplay, setMedicineTypeDisplay] = useState<'box-strip-tablet' | 'box-only'>('box-strip-tablet');
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [companyError, setCompanyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      setCompanyError(null);
      try {
        const response = await fetch(`${API_BASE}/companies`); // Assuming /api/companies is the endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // The API returns paginated data, so we need to access the 'data' property
        setCompanies(data.data);
      } catch (error: any) {
        setCompanyError(`Failed to load companies: ${error.message}`);
        console.error('Failed to fetch companies:', error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []);

  useEffect(() => {
    setFormData(getInitialData(drug, companies)); // Ensure companies are passed
    if (drug && typeof drug.type_drug === 'string') {
      const normalizedType = drug.type_drug.trim().toLowerCase();
      if (normalizedType === 'box-only') {
        setMedicineTypeDisplay('box-only');
      } else {
        setMedicineTypeDisplay('box-strip-tablet');
      }
    } else {
      setMedicineTypeDisplay('box-strip-tablet'); // Default for new drugs or if type_drug is not a string
    }
  }, [drug, companies]);

  const handleInputChange = (field: keyof Drug, value: any) => {
    let newValue = value;
    if (field === 'strips_per_box' || field === 'tablets_per_strip' || field === 'quantity_in_boxes') {
      newValue = value === '' ? undefined : parseInt(value) || 0;
    } else if (field === 'box_price' || field === 'box_cost_price' || field === 'strip_price' || field === 'strip_cost_price' || field === 'tablet_price' || field === 'tablet_cost_price') {
      newValue = value === '' ? undefined : parseFloat(value) || 0;
    } else if (field === 'company_id') {
      newValue = value ? parseInt(value) : undefined;
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
      newErrors.name = 'Brand name is required';
    }

    if (!formData.generic_name?.trim()) {
      newErrors.generic_name = 'Generic name is required';
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
                Brand Name *
              </Text>
              <TextField.Root
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter brand name"
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
                Company Name
              </Text>
              <Select.Root
                value={formData.company_id?.toString() || ''}
                onValueChange={(value) => handleInputChange('company_id', value)}
                disabled={isLoadingCompanies}
              >
                <Select.Trigger placeholder={isLoadingCompanies ? 'Loading companies...' : 'Select a company'} className="w-full" />
                <Select.Content>
                  {companyError && <Select.Item value="error-companies-status" disabled>{companyError}</Select.Item>}
                  {isLoadingCompanies && <Select.Item value="loading-companies-status" disabled>Loading companies...</Select.Item>}
                  {!isLoadingCompanies && companies.length === 0 && <Select.Item value="no-companies-found-status" disabled>No companies found</Select.Item>}
                  {companies.map((company) => (
                    <Select.Item key={company.id} value={company.id.toString()}>
                      {company.name}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
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
          <Grid columns="3" gap="4" mt="4">
              <Box>
                <Text as="label" size="2" weight="medium" className="block mb-1">
                  Quantity in Stock
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