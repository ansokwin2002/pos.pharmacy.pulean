'use client';
import { useState } from 'react';
import { Box, Flex, Button, TextField, Text, Select, Card, TextArea } from "@radix-ui/themes";
import { PageHeading } from '@/components/common/PageHeading';
import { toast } from 'sonner';

export default function RegisterPatientPage() {
  const [name, setName] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [age, setAge] = useState<string>('');
  const [telephone, setTelephone] = useState('');
  const [address, setAddress] = useState('');
  const [signOfLife, setSignOfLife] = useState<'BP' | 'P' | 'T' | 'RR' | ''>('');
  const [symptom, setSymptom] = useState('');
  const [diagnosis, setDiagnosis] = useState('');

  const handleSubmit = () => {
    if (!name) {
      toast.error('Patient name is required.');
      return;
    }
    console.log({ name, gender, age, telephone, address, signOfLife, symptom, diagnosis });
    toast.success('Patient added successfully!');
  };

  return (
    <Box className="space-y-4 w-full px-4">
      <PageHeading title="Add New Patient" description="Fill in the details of the new patient." />
      <Card style={{ width: '100%' }}>
        <Box p="4">
          <Flex direction="column" gap="3">
            {/* Name */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Name</Text>
              <TextField.Root
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter full name"
                required
              />
            </label>

            {/* Gender */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Gender</Text>
              <Select.Root value={gender} onValueChange={(value: 'male' | 'female') => setGender(value)}>
                <Select.Trigger placeholder="Select gender" />
                <Select.Content>
                  <Select.Item value="male">Male</Select.Item>
                  <Select.Item value="female">Female</Select.Item>
                </Select.Content>
              </Select.Root>
            </label>

            {/* Age */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Age</Text>
              <TextField.Root
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="Enter age"
                inputMode="numeric"
              />
            </label>

            {/* Telephone */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Telephone</Text>
              <TextField.Root
                value={telephone}
                onChange={(e) => setTelephone(e.target.value)}
                placeholder="Enter telephone number"
                inputMode="tel"
              />
            </label>

            {/* Address */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Address</Text>
              <TextField.Root
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Enter address"
              />
            </label>

            {/* Signs of Life */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Signs of Life</Text>
              <Select.Root value={signOfLife} onValueChange={(value: 'BP' | 'P' | 'T' | 'RR') => setSignOfLife(value)}>
                <Select.Trigger placeholder="Select sign" />
                <Select.Content>
                  <Select.Item value="BP">BP</Select.Item>
                  <Select.Item value="P">P</Select.Item>
                  <Select.Item value="T">T</Select.Item>
                  <Select.Item value="RR">RR</Select.Item>
                </Select.Content>
              </Select.Root>
            </label>

            {/* Symptom */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Symptom</Text>
              <TextArea
                value={symptom}
                onChange={(e) => setSymptom((e.target as HTMLTextAreaElement).value)}
                placeholder="Describe patient symptoms"
              />
            </label>

            {/* Diagnosis */}
            <label>
              <Text as="div" size="2" mb="1" weight="bold">Diagnosis</Text>
              <TextArea
                value={diagnosis}
                onChange={(e) => setDiagnosis((e.target as HTMLTextAreaElement).value)}
                placeholder="Enter diagnosis"
              />
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
