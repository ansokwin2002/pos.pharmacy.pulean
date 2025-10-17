'use client';
import { useState } from 'react';
import { Box, Flex, Button, TextField, Text, Select, Card } from "@radix-ui/themes";
import { PageHeading } from '@/components/common/PageHeading';
import { toast } from 'sonner';

export default function RegisterPatientPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');

  const handleSubmit = () => {
    if (!name) {
      toast.error('Patient name is required.');
      return;
    }
    // For now, just log the data to the console
    console.log({
      name,
      email,
      phone,
      address,
      city,
      gender,
    });
    toast.success('Patient added successfully!');
  };

  return (
    <Box className="space-y-4">
      <PageHeading title="Add New Patient" description="Fill in the details of the new patient." />
      <Card>
        <Box p="4">
          <Flex direction="column" gap="3">
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Name
              </Text>
              <TextField.Root
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Email
              </Text>
              <TextField.Root
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Phone
              </Text>
              <TextField.Root
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Address
              </Text>
              <TextField.Root
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                City
              </Text>
              <TextField.Root
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Enter city"
              />
            </label>
            <label>
              <Text as="div" size="2" mb="1" weight="bold">
                Gender
              </Text>
              <Select.Root value={gender} onValueChange={(value: 'male' | 'female') => setGender(value)}>
                <Select.Trigger placeholder="Select gender" />
                <Select.Content>
                  <Select.Item value="male">Male</Select.Item>
                  <Select.Item value="female">Female</Select.Item>
                </Select.Content>
              </Select.Root>
            </label>
          </Flex>

          <Flex gap="3" mt="4" justify="end">
            <Button variant="soft" color="gray">
              Cancel
            </Button>
            <Button onClick={handleSubmit}>Save</Button>
          </Flex>
        </Box>
      </Card>
    </Box>
  );
}