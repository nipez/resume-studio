"use client";

import { useId, type SVGProps } from "react";

type LogoProps = SVGProps<SVGSVGElement> & {
  size?: number;
};

export function Logo({ size = 36, className, ...props }: LogoProps) {
  const glowId = useId();
  const shadowId = useId();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <defs>
        <filter
          id={glowId}
          x="-40%"
          y="-40%"
          width="180%"
          height="180%"
          colorInterpolationFilters="sRGB"
        >
          <feGaussianBlur stdDeviation="2.2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter
          id={shadowId}
          x="-20%"
          y="-10%"
          width="140%"
          height="140%"
          colorInterpolationFilters="sRGB"
        >
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#231a2e" floodOpacity="0.18" />
        </filter>
      </defs>

      <rect
        x="10"
        y="12"
        width="27"
        height="31"
        rx="7"
        fill="#0fb5a6"
        filter={`url(#${glowId})`}
      />
      <rect x="5.5" y="8" width="27" height="31" rx="7" fill="#2f2640" />
      <rect
        x="1"
        y="4"
        width="27"
        height="31"
        rx="7"
        fill="#ffffff"
        stroke="rgba(35,26,46,0.08)"
        strokeWidth="0.75"
        filter={`url(#${shadowId})`}
      />
      <rect x="5.5" y="8.5" width="5.5" height="5.5" rx="1.4" fill="#ff5c38" />
      <path
        d="M9.25 15.25h5.65c2.45 0 3.95 1.25 3.95 3.05c0 1.45-0.85 2.45-2.25 2.75l2.35 4.95h-2.35l-2.15-4.55H11.5v4.55H9.25V15.25zm2.25 2.1v3.05h3.05c1.15 0 1.85-0.55 1.85-1.5c0-0.95-0.7-1.55-1.85-1.55H11.5z"
        fill="#231a2e"
      />
    </svg>
  );
}
