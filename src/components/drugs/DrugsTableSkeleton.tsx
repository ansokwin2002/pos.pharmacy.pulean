'use client';

import React from 'react';
import { Table, Flex, Box, Skeleton } from '@radix-ui/themes';
import { Checkbox } from '@radix-ui/themes';

export default function DrugsTableSkeleton() {
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
          <Table.ColumnHeaderCell><Skeleton>ID</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Brand Name</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Generic Name</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Company Name</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Stock</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Expiry Date</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Status</Skeleton></Table.ColumnHeaderCell>
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
            <Table.Cell><Skeleton>DRG-001</Skeleton></Table.Cell>
            <Table.RowHeaderCell><Skeleton>Very Long Drug Brand Name</Skeleton></Table.RowHeaderCell>
            <Table.Cell><Skeleton>Generic Drug Name</Skeleton></Table.Cell>
            <Table.Cell><Skeleton>Company A</Skeleton></Table.Cell>
            <Table.Cell><Skeleton>1000</Skeleton></Table.Cell>
            <Table.Cell><Skeleton>01/01/2025</Skeleton></Table.Cell>
            <Table.Cell><Skeleton>Active</Skeleton></Table.Cell>
            <Table.Cell>
              <Flex gap="2">
                <Skeleton><Box style={{ width: 24, height: 24 }} /></Skeleton>
                <Skeleton><Box style={{ width: 24, height: 24 }} /></Skeleton>
                <Skeleton><Box style={{ width: 24, height: 24 }} /></Skeleton>
                <Skeleton><Box style={{ width: 24, height: 24 }} /></Skeleton>
              </Flex>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
