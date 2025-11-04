'use client';
import { DropdownMenu, IconButton, Text } from "@radix-ui/themes";
import { MoreVertical, UserPlus, TestTube, Activity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface Patient {
  id: number | string;
  name: string;
  telephone?: string | null;
  address?: string | null;
  gender?: 'male' | 'female' | string | null;
  age?: number | null;
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

  const handleBBClick = () => {
    // TODO: Implement BB functionality
    console.log('BB clicked for patient:', patient.name);
  };

  const handleAAClick = () => {
    // TODO: Implement AA functionality
    console.log('AA clicked for patient:', patient.name);
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
        <DropdownMenu.Item onClick={handleBBClick}>
          <TestTube size={14} />
          BB
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleAAClick}>
          <Activity size={14} />
          AA
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => router.push(`/opd/patients/${patient.id}/history`)}>
          <Activity size={14} /> {/* Using Activity icon for now, can change later */}
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
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const handleOPDClick = () => {
    // Navigate to register page with secure patient ID
    router.push(`/opd/register?id=${patient.id}`);
    setIsOpen(false);
  };

  const handleBBClick = () => {
    // TODO: Implement BB functionality
    console.log('BB clicked for patient:', patient.name);
    setIsOpen(false);
  };

  const handleAAClick = () => {
    // TODO: Implement AA functionality
    console.log('AA clicked for patient:', patient.name);
    setIsOpen(false);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  return (
    <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenu.Trigger asChild>
        <Text
          onContextMenu={handleRightClick}
          style={{
            cursor: 'context-menu',
            userSelect: 'none',
            borderBottom: '1px dotted var(--gray-8)',
            paddingBottom: '1px'
          }}
          className="hover:bg-gray-100 px-1 py-0.5 rounded transition-colors"
          title="Right-click for quick actions (OPD, BB, AA)"
        >
          {patient.name}
        </Text>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onClick={handleOPDClick}>
          <UserPlus size={14} />
          OPD
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleBBClick}>
          <TestTube size={14} />
          BB
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={handleAAClick}>
          <Activity size={14} />
          AA
        </DropdownMenu.Item>
        <DropdownMenu.Item onClick={() => { router.push(`/opd/patients/${patient.id}/history`); setIsOpen(false); }}>
          <Activity size={14} /> {/* Using Activity icon for now, can change later */}
          History
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
