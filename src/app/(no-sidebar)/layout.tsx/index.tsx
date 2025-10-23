"use client";

import { Box } from "@radix-ui/themes";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function NoSidebarLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) router.replace('/auth/login');
    } catch {}
  }, [router]);

  // Cross-tab auth sync
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'auth_token') {
        const token = localStorage.getItem('auth_token');
        if (!token) { toast.info('Session ended. Please sign in again.'); router.replace('/auth/login'); }
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [router]);

  return (
    <Box className="min-h-screen">
      {children}
    </Box>
  );
}
