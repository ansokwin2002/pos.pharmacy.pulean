"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { toast } from 'sonner';
import { clearAuth } from '@/utilities/api/auth-helpers';

export default function LogoutListener() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const syncLogout = (event: StorageEvent) => {
      if (event.key === 'logout') {
        // If we are already on an auth page, don't do anything
        if (pathname.startsWith('/auth')) {
          return;
        }
        
        toast.info('You have been logged out from another tab.');
        clearAuth(); // This is still good to have for client-state cleanup
        router.replace('/auth/login');
      }
    };

    window.addEventListener('storage', syncLogout);

    return () => {
      window.removeEventListener('storage', syncLogout);
    };
  }, [router, pathname]);

  return null;
}
