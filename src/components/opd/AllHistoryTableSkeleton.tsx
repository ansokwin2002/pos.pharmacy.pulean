'use client';

import React from 'react';
import { Table, Flex, Box, Skeleton, Card } from '@radix-ui/themes';

export default function AllHistoryTableSkeleton() {
  const skeletonRows = Array.from({ length: 25 }, (_, i) => i); // Create 25 skeleton rows

  return (
    <Card>
      <Table.Root variant="surface">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell><Skeleton>No</Skeleton></Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell><Skeleton>Type</Skeleton></Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell><Skeleton>Patient Name</Skeleton></Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell><Skeleton>Total</Skeleton></Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell><Skeleton>Date</Skeleton></Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell><Skeleton>Actions</Skeleton></Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {skeletonRows.map((row) => (
            <Table.Row key={row}>
              <Table.Cell><Skeleton>000</Skeleton></Table.Cell>
              <Table.Cell><Skeleton>Type</Skeleton></Table.Cell>
              <Table.Cell><Skeleton>Patient Name Placeholder</Skeleton></Table.Cell>
              <Table.Cell><Skeleton>$000.00</Skeleton></Table.Cell>
              <Table.Cell><Skeleton>01/01/2024</Skeleton></Table.Cell>
              <Table.Cell>
                <Flex gap="2">
                  <Skeleton><Box style={{ width: 24, height: 24 }} /></Skeleton>
                </Flex>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Card>
  );
}
