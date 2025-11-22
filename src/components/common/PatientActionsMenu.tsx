'use client';
import { DropdownMenu, IconButton, Text, Spinner, Flex } from "@radix-ui/themes";
import { MoreVertical, UserPlus, History } from 'lucide-react';
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
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string>('');

  const handleOPDClick = () => {
    setLoadingAction('OPD');
    setIsLoading(true);
    setIsOpen(false);
    // Navigate to register page with secure patient ID
    router.push(`/opd/register?id=${patient.id}`);
  };

  const handleHistoryClick = () => {
    setLoadingAction('History');
    setIsLoading(true);
    setIsOpen(false);
    router.push(`/opd/patients/${patient.id}/history`);
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(true);
  };

  return (
    <>
      {/* Loading Overlay */}
      {isLoading && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '32px 48px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
              textAlign: 'center',
            }}
          >
            <Flex direction="column" gap="4" align="center">
              <Spinner size="3" />
              <Text size="4" weight="medium">
                Loading {loadingAction}...
              </Text>
              <Text size="2" color="gray">
                Please wait while we prepare the page
              </Text>
            </Flex>
          </div>
        </div>
      )}

      <DropdownMenu.Root open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenu.Trigger asChild>
          <span
            onContextMenu={handleRightClick}
            style={{
              cursor: 'context-menu',
              userSelect: 'none',
              display: 'inline-block'
            }}
            className="hover:bg-gray-100 dark:hover:bg-gray-800 px-1 py-0.5 rounded transition-colors"
            title="Right-click for quick actions (OPD, History)"
          >
            <Text>{patient.name || 'N/A'}</Text>
          </span>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onClick={handleOPDClick}>
            <UserPlus size={14} />
            OPD
          </DropdownMenu.Item>
          <DropdownMenu.Item onClick={handleHistoryClick}>
            <History size={14} />
            History
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </>
  );
}
