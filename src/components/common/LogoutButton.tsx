'use client';

import { Button } from '@radix-ui/themes';
import { useRouter } from 'next/navigation';
import { clearAuth } from '@/utilities/api/auth-helpers';
import { logoutRequest } from '@/utilities/api/auth-helpers';
import { toast } from 'sonner';

export default function LogoutButton({ size = '2' as any }) {
  const router = useRouter();
  const onLogout = async () => {
    try {
      await logoutRequest();
    } catch {}
    clearAuth();
    toast.info('Logged out');
    router.replace('/auth/login');
  };
  return (
    <Button size={size} color="red" variant="soft" onClick={onLogout}>
      Logout
    </Button>
  );
}
