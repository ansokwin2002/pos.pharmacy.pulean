'use client';
import { DropdownMenu, IconButton, Text, Spinner, Flex, Button } from "@radix-ui/themes";
import { MoreVertical, UserPlus, History, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Patient {
  id: number | string;
  name: string;
  telephone?: string | null;
  address?: string | null;
  gender?: 'male' | 'female' | string | null;
  age?: string | null;
  signs_of_life?: string | null;
  symptom?: string | null;
  diagnosis?: string | null;
  email?: string;
  phone?: string;
  city?: string;
}

interface PatientActionsMenuProps {
  patient: Patient;
}

export function PatientActionsMenu({ patient }: PatientActionsMenuProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleOPDClick = () => {
    // Navigate to register page with secure patient ID
    router.push(`/opd/register?id=${patient.id}`);
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger>
        <IconButton variant="ghost" size="1">
          <MoreVertical size={14} />
        </IconButton>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={handleOPDClick}>
          <UserPlus size={14} />
          OPD
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => router.push(`/opd/patients/${patient.id}/history`)}>
          <History size={14} />
          History
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

// Component for patient name with right-click context menu
interface PatientNameWithMenuProps {
  patient: Patient;
}

export function PatientNameWithMenu({ patient }: PatientNameWithMenuProps) {
  console.log('Patient prop in PatientNameWithMenu:', patient);
  const router = useRouter();
  const [isOPDLoading, setIsOPDLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);

  const handleOPDClick = () => {
    setIsOPDLoading(true);
    router.push(`/opd/register?id=${patient.id}`);
  };

  const handleHistoryClick = () => {
    setIsHistoryLoading(true);
    router.push(`/opd/patients/${patient.id}/history`);
  };

  return (
    <>
      <Flex align="center" gap="3">
        <Text>{patient.name || 'N/A'}</Text>
        <Flex align="center" gap="2">
            <Button size="1" variant="soft" onClick={handleOPDClick} disabled={isOPDLoading}>
                {isOPDLoading ? <Loader2 size={12} className="animate-spin" /> : <UserPlus size={12} />}
                OPD
            </Button>
            <Button size="1" variant="soft" color="gray" onClick={handleHistoryClick} disabled={isHistoryLoading}>
                {isHistoryLoading ? <Loader2 size={12} className="animate-spin" /> : <History size={12} />}
                History
            </Button>
        </Flex>
      </Flex>
    </>
  );
}
