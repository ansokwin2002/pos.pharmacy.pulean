'use client';

import React, { useState, useEffect } from 'react';
import { Box, Button, Flex, TextField, Text, Switch } from '@radix-ui/themes';
import { Company } from '@/types/company';
import { toast } from 'sonner';

interface CompanyFormProps {
  company?: Company;
  onSubmit: (data: Partial<Company>) => void;
  onCancel: () => void;
}

export default function CompanyForm({ company, onSubmit, onCancel }: CompanyFormProps) {
  const [name, setName] = useState('');
  const [status, setStatus] = useState(true);

  useEffect(() => {
    if (company) {
      setName(company.name);
      setStatus(company.status);
    }
  }, [company]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Company name is required.');
      return;
    }
    onSubmit({ name, status });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="4">
        <label>
          <Text as="div" size="2" mb="1" weight="bold">
            Company Name
          </Text>
          <TextField.Root
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter company name"
            required
          />
        </label>
        <label>
          <Flex align="center" gap="2">
            <Switch
              checked={status}
              onCheckedChange={setStatus}
            />
            <Text as="div" size="2" weight="bold">
              Active Status
            </Text>
          </Flex>
        </label>
      </Flex>
      <Flex gap="3" mt="6" justify="end">
        <Button type="button" variant="soft" color="gray" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {company ? 'Update Company' : 'Create Company'}
        </Button>
      </Flex>
    </form>
  );
}
