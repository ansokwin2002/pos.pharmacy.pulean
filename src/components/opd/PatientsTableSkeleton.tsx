'use client';

import React from 'react';
import { Table, Flex, Box, Skeleton } from '@radix-ui/themes';

export default function PatientsTableSkeleton() {
  const skeletonRows = Array.from({ length: 25 }, (_, i) => i); // Create 25 skeleton rows

  return (
    <Table.Root variant="surface" style={{ width: '100%' }}>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell><Skeleton>No</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Name</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Telephone</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Age</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Address</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Gender</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Created At</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Updated At</Skeleton></Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell><Skeleton>Actions</Skeleton></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {skeletonRows.map((row) => (
          <Table.Row key={row}>
            <Table.Cell><Skeleton>000</Skeleton></Table.Cell>
            <Table.RowHeaderCell><Skeleton>Patient Name Placeholder</Skeleton></Table.RowHeaderCell>
            <Table.Cell><Skeleton>+855 12 345 678</Skeleton></Table.Cell>
            <Table.Cell><Skeleton>30</Skeleton></Table.Cell>
            <Table.Cell><Skeleton>Some Address, City</Skeleton></Table.Cell>
            <Table.Cell><Skeleton>Male</Skeleton></Table.Cell>
            <Table.Cell><Skeleton>01/01/2024, 12:00 AM</Skeleton></Table.Cell>
            <Table.Cell><Skeleton>01/01/2024, 12:00 AM</Skeleton></Table.Cell>
            <Table.Cell>
              <Flex gap="2">
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
