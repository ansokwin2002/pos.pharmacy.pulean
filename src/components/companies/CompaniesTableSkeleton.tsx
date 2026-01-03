'use client';

import React from 'react';
import { Table, Flex, Box, Skeleton } from '@radix-ui/themes';

export default function CompaniesTableSkeleton() {
  const skeletonRows = Array.from({ length: 25 }, (_, i) => i); // Create 25 skeleton rows

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell style={{ width: '40px' }}>
            <Skeleton>
              <Box style={{ width: 20, height: 20 }} />
            </Skeleton>
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell style={{ width: '80px' }}><Skeleton>No.</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Company Name</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Status</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Created At</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Updated At</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Actions</Skeleton></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {skeletonRows.map((row) => (
          <Table.Row key={row}>
            <Table.Cell>
              <Skeleton>
                <Box style={{ width: 20, height: 20 }} />
              </Skeleton>
            </Table.Cell>
            <Table.Cell><Skeleton>000</Skeleton></Table.Cell>
            <Table.RowHeaderCell><Skeleton>A very long company name to take up space</Skeleton></Table.RowHeaderCell>
            <Table.Cell><Skeleton>Inactive</Skeleton></Table.Cell>
            <Table.Cell><Skeleton>01/01/2024, 12:00:00 AM</Skeleton></Table.Cell>
            <Table.Cell><Skeleton>01/01/2024, 12:00:00 AM</Skeleton></Table.Cell>
            <Table.Cell>
              <Flex gap="3">
                <Skeleton><Box style={{ width: 32, height: 32 }} /></Skeleton>
                <Skeleton><Box style={{ width: 32, height: 32 }} /></Skeleton>
              </Flex>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
