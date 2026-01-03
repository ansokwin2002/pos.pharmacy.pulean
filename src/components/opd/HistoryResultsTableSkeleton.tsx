'use client';

import React from 'react';
import { Table, Flex, Box, Skeleton } from '@radix-ui/themes';

export default function HistoryResultsTableSkeleton() {
  const skeletonRows = Array.from({ length: 10 }, (_, i) => i); // Create 10 skeleton rows

  return (
    <Table.Root variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell><Skeleton>Patient Name</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Diagnosis</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Date</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Actions</Skeleton></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {skeletonRows.map((row) => (
          <Table.Row key={row}>
            <Table.Cell><Skeleton>Patient Name Placeholder</Skeleton></Table.Cell>
            <Table.Cell><Skeleton>Diagnosis Description Placeholder</Skeleton></Table.Cell>
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
  );
}
