"use client";

import { Box } from "@radix-ui/themes";
import { useEffect } from "react";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function POSLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Simple auth guard for POS routes
  useEffect(() => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.replace('/auth/login');
      }
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

  // Disable zoom on mobile browsers
  useEffect(() => {
    // Add meta tag to disable zooming
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
    } else {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }

    // Add meta title
    const titleMeta = document.querySelector('title');
    if (titleMeta) {
      titleMeta.textContent = "Punleukrek Pharmacy | Next.js Restaurant Management System Template";
    } else {
      const newTitleElement = document.createElement('title');
      newTitleElement.textContent = "Punleukrek Pharmacy | Next.js Restaurant Management System Template";
      document.head.appendChild(newTitleElement);
    }
    
    // Cleanup function
    return () => {
      const metaTag = document.querySelector('meta[name="viewport"]');
      if (metaTag) {
        metaTag.setAttribute('content', 'width=device-width, initial-scale=1.0');
      }
    };
  }, []);

  return (      
    <Box height="100vh" className="bg-background">
      <Box height="100vh" className="overflow-auto p-4">
        {children}
      </Box>
    </Box>
  );
}
