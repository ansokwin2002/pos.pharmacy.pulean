"use client";
import { useTheme } from "next-themes";

interface BrandLogoProps {
  size?: number; // height in px
  showText?: boolean;
}

// Simple modern pharmacy cross + circle icon with adaptable theme color
export default function BrandLogo({ size = 24, showText = true }: BrandLogoProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  // Pharmacy green accent; uses CSS var fallback to a green tone
  const accent = 'var(--green-9, #10b981)';
  const textColor = isDark ? 'var(--gray-12)' : 'var(--gray-12)';

  return (
    <div className="flex items-center gap-2 select-none" aria-label="punleukrek pharmacy">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        {/* Modern shield container */}
        <path
          d="M12 2.5c2.4 1.5 4.8 2.2 7.2 2.5v7.2c0 4.3-3 7.7-7.2 9.3-4.2-1.6-7.2-5-7.2-9.3V5c2.4-.3 4.8-1 7.2-2.5Z"
          fill={isDark ? 'var(--gray-3)' : '#F2FBF7'}
          stroke={accent}
          strokeWidth="0.6"
        />
        {/* Dual-tone cross with subtle depth */}
        <path d="M13.2 7.2h-2.4v3.2H7.6v2.4h3.2V16h2.4v-3.2h3.2v-2.4h-3.2V7.2Z" fill={accent} />
        <path d="M13.2 7.2h-1.2v3.2h-3.2v1.2h3.2V16h1.2v-4.4h4.4v-1.2h-4.4V7.2Z" fill={isDark ? 'rgba(0,0,0,0.08)' : 'rgba(255,255,255,0.6)'} />
      </svg>
      {showText && (
        <span
          className="font-semibold tracking-tight"
          style={{ color: textColor, fontSize: 16 }}
        >
          punleukrek pharmacy
        </span>
      )}
    </div>
  );
}
