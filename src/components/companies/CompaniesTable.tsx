'use client';

import React from 'react';
import { Table, Flex, Button, IconButton, Tooltip, Badge, Checkbox, Text as RadixText } from '@radix-ui/themes';
import { Pencil, Trash2 } from 'lucide-react';
import { Company } from '@/types/company';

interface CompaniesTableProps {
  companies: Company[];
  selectedIds: (string | number)[];
  onEdit: (company: Company) => void;
  onDelete: (company: Company) => void;
  onSelectionChange: (id: string | number) => void;
  onSelectAll: () => void;
}

export default function CompaniesTable({
  companies,
  selectedIds,
  onEdit,
  onDelete,
  onSelectionChange,
  onSelectAll,
}: CompaniesTableProps) {
  const allSelected = companies.length > 0 && selectedIds.length === companies.length;

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>
            <Checkbox
              checked={allSelected}
              onCheckedChange={onSelectAll}
              aria-label="Select all rows"
            />
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>No.</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Company Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Created At</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Updated At</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Actions</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {companies.length === 0 ? (
          <Table.Row>
            <Table.Cell colSpan={7}>
              <RadixText align="center" className="py-4 text-slate-500">No companies found</RadixText>
            </Table.Cell>
          </Table.Row>
        ) : (
          companies.map((company, idx) => (
            <Table.Row key={company.id} align="center">
              <Table.Cell>
                <Checkbox
                  checked={selectedIds.includes(company.id)}
                  onCheckedChange={() => onSelectionChange(company.id)}
                  aria-label={`Select row ${company.id}`}
                />
              </Table.Cell>
              <Table.Cell>{(idx + 1).toString().padStart(3, '0')}</Table.Cell>
              <Table.RowHeaderCell>{company.name}</Table.RowHeaderCell>
              <Table.Cell>
                <Badge color={company.status ? 'green' : 'red'}>
                  {company.status ? 'Active' : 'Inactive'}
                </Badge>
              </Table.Cell>
              <Table.Cell>{new Date(company.created_at).toLocaleString()}</Table.Cell>
              <Table.Cell>{new Date(company.updated_at).toLocaleString()}</Table.Cell>
              <Table.Cell>
                <Flex gap="3">
                  <Tooltip content="Edit Company">
                    <IconButton size="1" variant="soft" onClick={() => onEdit(company)}>
                      <Pencil size={16} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip content="Delete Company">
                    <IconButton size="1" variant="soft" color="red" onClick={() => onDelete(company)}>
                      <Trash2 size={16} />
                    </IconButton>
                  </Tooltip>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))
        )}
      </Table.Body>
    </Table.Root>
  );
}
