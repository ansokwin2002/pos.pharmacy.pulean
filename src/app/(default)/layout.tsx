"use client";

import { Box, Flex } from "@radix-ui/themes";
import TopBar from "@/components/common/TopBar";
import Sidebar from "@/components/common/Sidebar";
import { ReactNode, useCallback, useEffect, useState } from "react";
import { AppOrganizationProvider } from "@/contexts/AppOrganizationContext";
import { Text } from "@radix-ui/themes";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function RootLayout({ children }: { children: ReactNode }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarWidth = '260px';
  
  const onScroll = useCallback(() => {
    const mainContent = document.querySelector('[data-main-content]');
    if (mainContent) {
      const scrollPosition = mainContent.scrollTop;
      setIsScrolled(scrollPosition > 50);
    }
  }, []);

  useEffect(() => {
    const mainContent = document.querySelector('[data-main-content]');
    if (mainContent) {
      mainContent.addEventListener('scroll', onScroll);
      return () => {
        mainContent.removeEventListener('scroll', onScroll);
      };
    }
  }, [onScroll]);

  // Simple auth guard: check token in localStorage; if missing, redirect to login
  useEffect(() => {
    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        router.replace('/auth/login');
      }
    } catch {}
  }, [router]);

  // Cross-tab auth sync: listen for auth_token changes via storage events
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
    <AppOrganizationProvider>
      <Box className="flex flex-col h-screen overflow-x-hidden">
        {/* Backdrop for mobile */}
        {isSidebarOpen && (
          <Box 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
        
        {/* Sidebar */}
        <Box 
          style={{ position: 'fixed', zIndex: 20, width: sidebarWidth, height: '100vh' }} 
          className={`transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[260px] lg:translate-x-0'}`}
        >
          <Sidebar width={sidebarWidth} onClose={() => setIsSidebarOpen(false)} />
        </Box>
        
        {/* Main content area */}
        <Box 
          className="h-screen overflow-y-auto lg:ml-[260px] lg:w-[calc(100%-260px)] min-w-0"
          data-main-content
        >
          {/* Top bar */}
          <TopBar isScrolled={isScrolled} onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
          
          {/* Page content */}
          <Box className="flex-1 overflow-y-auto">
            <Box className="w-full py-6 px-4">
              {children}
            </Box>
          </Box>
          
          {/* Footer */}
          <Box className="py-4 mt-auto">
            <Flex justify="center">
              <Text size="1" className="text-gray-400 dark:text-neutral-600 text-center">&copy; {new Date().getFullYear()} Punleukrek Pharmacy. All rights reserved.</Text>
            </Flex>
          </Box>
        </Box>
      </Box>
    </AppOrganizationProvider>
  );
} 