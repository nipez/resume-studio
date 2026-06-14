"use client";

import { useEffect, useRef, type ReactNode } from "react";

type RevealProps = {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

export function Reveal({ children, className = "", style }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (!("IntersectionObserver" in window)) {
      el.classList.add("in");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    io.observe(el);
    const timeout = setTimeout(() => el.classList.add("in"), 3000);

    return () => {
      io.disconnect();
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div ref={ref} data-reveal className={className} style={style}>
      {children}
    </div>
  );
}
