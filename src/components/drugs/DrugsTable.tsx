'use client';

import React, { useState, useMemo, useCallback } from 'react';
import {
  Badge,
  Box,
  Flex,
  IconButton,
  Table,
  Text,
  Tooltip
} from '@radix-ui/themes';
import { Drug } from '@/types/inventory';
import { formatCurrency } from '@/utilities';
import { Edit, Trash2, Eye } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SortableHeader } from '@/components/common/SortableHeader';

interface DrugsTableProps {
  drugs: Drug[];
  onEdit?: (drug: Drug) => void;
  onDelete?: (drug: Drug) => void;
  onView?: (drug: Drug) => void;
}

export default function DrugsTable({ drugs, onEdit, onDelete, onView }: DrugsTableProps) {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleEditDrug = (drug: Drug) => {
    if (onEdit) {
      onEdit(drug);
    } else {
      router.push(`/drugs/edit/${drug.id}`);
    }
  };

  const handleViewDrug = (drug: Drug) => {
    console.log('DrugsTable handleViewDrug called:', drug.id);
    if (onView) {
      onView(drug);
    } else {
      router.push(`/drugs/${drug.id}`);
    }
  };

  const handleDeleteDrug = (drug: Drug) => {
    if (onDelete) {
      onDelete(drug);
    } else {
      console.log('Deleting drug:', drug);
    }
  };

  const getStatusBadge = (status: string) => {
    return status === 'active' ? (
      <Badge color="green" variant="soft" size="1">Active</Badge>
    ) : (
      <Badge color="red" variant="soft" size="1">Inactive</Badge>
    );
  };

  const getStockBadge = (quantity: number) => {
    if (quantity === 0) {
      return <Badge color="red" variant="soft" size="1">Out of Stock</Badge>;
    } else if (quantity < 50) {
      return <Badge color="orange" variant="soft" size="1">Low Stock</Badge>;
    } else {
      return <Badge color="green" variant="soft" size="1">In Stock</Badge>;
    }
  };

  const formatExpiryDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <Badge color="red" variant="soft" size="1">Expired</Badge>;
    } else if (diffDays <= 30) {
      return <Badge color="orange" variant="soft" size="1">Expires Soon</Badge>;
    } else {
      return <Text size="2">{date.toLocaleDateString()}</Text>;
    }
  };

  const sortedDrugs = useMemo(() => {
    if (!sortConfig) return drugs;

    return [...drugs].sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortConfig.key) {
        case 'name':
          aValue = a.name;
          bValue = b.name;
          break;
        case 'generic_name':
          aValue = a.generic_name;
          bValue = b.generic_name;
          break;
        case 'brand_name':
          aValue = a.brand_name || '';
          bValue = b.brand_name || '';
          break;
        case 'price':
          aValue = a.price;
          bValue = b.price;
          break;
        case 'quantity':
          aValue = a.quantity;
          bValue = b.quantity;
          break;
        case 'expiry_date':
          aValue = a.expiry_date;
          bValue = b.expiry_date;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [drugs, sortConfig]);

  return (
    <Box className="overflow-auto">
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell>
              <SortableHeader
                label="Drug Name"
                sortKey="name"
                currentSort={sortConfig}
                onSort={handleSort}
              />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <SortableHeader
                label="Generic Name"
                sortKey="generic_name"
                currentSort={sortConfig}
                onSort={handleSort}
              />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <SortableHeader
                label="Brand Name"
                sortKey="brand_name"
                currentSort={sortConfig}
                onSort={handleSort}
              />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <SortableHeader
                label="Price"
                sortKey="price"
                currentSort={sortConfig}
                onSort={handleSort}
              />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <SortableHeader
                label="Stock"
                sortKey="quantity"
                currentSort={sortConfig}
                onSort={handleSort}
              />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Unit</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <SortableHeader
                label="Expiry Date"
                sortKey="expiry_date"
                currentSort={sortConfig}
                onSort={handleSort}
              />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <SortableHeader
                label="Status"
                sortKey="status"
                currentSort={sortConfig}
                onSort={handleSort}
              />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell align="center">Actions</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>

        <Table.Body>
          {sortedDrugs.length === 0 ? (
            <Table.Row>
              <Table.Cell colSpan={9}>
                <Text align="center" className="py-4 text-slate-500">No drugs found</Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            sortedDrugs.map(drug => (
              <Table.Row key={drug.id} className="align-middle cursor-pointer hover:bg-slate-50 dark:hover:bg-neutral-800" onClick={() => handleViewDrug(drug)}>
                <Table.Cell>
                  <Box>
                    <Text weight="medium" as="div">{drug.name}</Text>
                    {drug.barcode && (
                      <Text size="1" color="gray">{drug.barcode}</Text>
                    )}
                  </Box>
                </Table.Cell>
                <Table.Cell>{drug.generic_name}</Table.Cell>
                <Table.Cell>
                  {drug.brand_name ? (
                    <Text>{drug.brand_name}</Text>
                  ) : (
                    <Text color="gray">-</Text>
                  )}
                </Table.Cell>
                <Table.Cell>{formatCurrency(drug.price)}</Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    <Text>{drug.quantity}</Text>
                    {getStockBadge(drug.quantity)}
                  </Flex>
                </Table.Cell>
                <Table.Cell>{drug.unit}</Table.Cell>
                <Table.Cell>{formatExpiryDate(drug.expiry_date)}</Table.Cell>
                <Table.Cell>{getStatusBadge(drug.status)}</Table.Cell>
                <Table.Cell>
                  <Flex gap="2" justify="center">
                    <Tooltip content="View Details">
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="gray"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDrug(drug);
                        }}
                      >
                        <Eye size={14} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="Edit Drug">
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="blue"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditDrug(drug);
                        }}
                      >
                        <Edit size={14} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="Delete Drug">
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDrug(drug);
                        }}
                      >
                        <Trash2 size={14} />
                      </IconButton>
                    </Tooltip>
                  </Flex>
                </Table.Cell>
              </Table.Row>
            ))
          )}
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
