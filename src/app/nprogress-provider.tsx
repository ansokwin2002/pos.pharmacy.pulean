"use client";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import NProgress from "nprogress";

export default function NProgressProvider() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    NProgress.configure({ showSpinner: true, trickleSpeed: 150 });
  }, []);

  // Start on route/search change, finish shortly after to avoid hanging bar
  useEffect(() => {
    NProgress.start();
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      NProgress.done();
      timerRef.current = null;
    }, 300);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, searchParams?.toString()]);

  return null;
}
