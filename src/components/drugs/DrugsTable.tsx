'use client';

import React, { useState, useMemo, useCallback, useEffect } from 'react';
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
import { Company } from '@/types/company'; // Need to import Company type
import { API_BASE } from '@/utilities/constants'; // Need API_BASE for fetching
import { Edit, Trash2, Eye, Package, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { SortableHeader } from '@/components/common/SortableHeader';

import { Checkbox } from '@radix-ui/themes';

interface DrugsTableProps {
  drugs: Drug[];
  selectedIds: string[];
  onEdit?: (drug: Drug) => void;
  onDelete?: (drug: Drug) => void;
  onView?: (drug: Drug) => void;
  onSelectionChange: (id: string) => void;
  onSelectAll: () => void;
}

export default function DrugsTable({ 
  drugs, 
  selectedIds,
  onEdit, 
  onDelete, 
  onView,
  onSelectionChange,
  onSelectAll
}: DrugsTableProps) {
  const router = useRouter();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [loadingAction, setLoadingAction] = useState<{ drugId: string; action: 'view' | 'add-stock' | 'edit' | 'delete' } | null>(null);
  const allVisibleSelected = drugs.length > 0 && selectedIds.length === drugs.length;

  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoadingCompanies, setIsLoadingCompanies] = useState(true);
  const [companyError, setCompanyError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      setIsLoadingCompanies(true);
      setCompanyError(null);
      try {
        const response = await fetch(`${API_BASE}/companies`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setCompanies(data.data);
      } catch (error: any) {
        setCompanyError(`Failed to load companies: ${error.message}`);
        console.error('Failed to fetch companies:', error);
      } finally {
        setIsLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, []); // Run once on component mount

  // Create a map for quick lookup
  const companyMap = useMemo(() => {
    return new Map(companies.map(company => [company.id, company.name]));
  }, [companies]);

  // Function to get company name
  const getCompanyName = useCallback((companyId: number | undefined) => {
    if (companyId === undefined || companyId === null) return '-';
    return companyMap.get(companyId) || '-';
  }, [companyMap]);



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
        case 'id':
          aValue = a.id;
          bValue = b.id;
          break;
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
        case 'company_name':
          aValue = getCompanyName(a.company_id);
          bValue = getCompanyName(b.company_id);
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
              <Checkbox 
                checked={allVisibleSelected}
                onCheckedChange={onSelectAll}
                aria-label="Select all rows"
              />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <SortableHeader
                label="ID"
                sortKey="id"
                currentSort={sortConfig}
                onSort={handleSort}
              />
            </Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>
              <SortableHeader
                label="Brand Name"
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
                label="Company Name"
                sortKey="company_name"
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
              <Table.Cell colSpan={8}>
                <Text align="center" className="py-4 text-slate-500">No drugs found</Text>
              </Table.Cell>
            </Table.Row>
          ) : (
            sortedDrugs.map(drug => (
              <Table.Row key={drug.id} className="align-middle">
                <Table.Cell onClick={(e) => e.stopPropagation()}>
                  <Checkbox 
                    checked={selectedIds.includes(drug.id)}
                    onCheckedChange={() => onSelectionChange(drug.id)}
                    aria-label={`Select row ${drug.id}`}
                  />
                </Table.Cell>
                <Table.Cell onClick={() => handleViewDrug(drug)} className="cursor-pointer">
                  <Text size="2">{drug.id}</Text>
                </Table.Cell>
                <Table.Cell onClick={() => handleViewDrug(drug)} className="cursor-pointer">
                  <Box>
                    <Text weight="medium" as="div">{drug.name}</Text>
                    {drug.barcode && (
                      <Text size="1" color="gray">{drug.barcode}</Text>
                    )}
                  </Box>
                </Table.Cell>
                <Table.Cell>{drug.generic_name}</Table.Cell>
                <Table.Cell>
                  <Text>{getCompanyName(drug.company_id)}</Text>
                </Table.Cell>
                <Table.Cell>
                  <Flex align="center" gap="2">
                    <Text>{drug.quantity}</Text>
                    {getStockBadge(drug.quantity)}
                  </Flex>
                </Table.Cell>
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
                          setLoadingAction({ drugId: drug.id, action: 'view' });
                          handleViewDrug(drug);
                        }}
                        disabled={loadingAction?.drugId === drug.id}
                      >
                        {loadingAction?.drugId === drug.id && loadingAction?.action === 'view' ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Eye size={14} />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Tooltip content="Add Stock">
                      <IconButton
                        size="1"
                        variant="ghost"
                        color="green"
                        onClick={(e) => {
                          e.stopPropagation();
                          setLoadingAction({ drugId: drug.id, action: 'add-stock' });
                          router.push(`/drugs/add-stock/${drug.id}`);
                        }}
                        disabled={loadingAction?.drugId === drug.id}
                      >
                        {loadingAction?.drugId === drug.id && loadingAction?.action === 'add-stock' ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Package size={14} />
                        )}
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
