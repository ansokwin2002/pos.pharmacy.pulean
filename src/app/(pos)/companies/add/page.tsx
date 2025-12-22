'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Card } from '@radix-ui/themes';
import { toast } from 'sonner';
import { PageHeading } from '@/components/common/PageHeading';
import { usePageTitle } from '@/hooks/usePageTitle';
import CompanyForm from '@/components/companies/CompanyForm';
import { createCompany } from '@/utilities/api/companies';
import { Company } from '@/types/company';

export default function AddCompanyPage() {
  usePageTitle('Add Company');
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddCompany = async (companyData: Partial<Company>) => {
    setIsSubmitting(true);
    try {
      await createCompany(companyData);
      toast.success('Company added successfully!');
      router.push('/companies');
    } catch (err: any) {
      console.error('Failed to add company:', err);
      toast.error(err.detail?.message || err.message || 'Failed to add company');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box>
      <PageHeading title="Add New Company" description="Fill in the details to add a new company to your system." />
      <Card className="mt-5">
        <CompanyForm onSubmit={handleAddCompany} onCancel={() => router.push('/companies')} isLoading={isSubmitting} />
      </Card>
    </Box>
  );
}
