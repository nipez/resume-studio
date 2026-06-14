"use client";

import { useEffect } from "react";

type ToastProps = {
  message: string;
  onDone: () => void;
};

export function Toast({ message, onDone }: ToastProps) {
  useEffect(() => {
    const t = setTimeout(onDone, 1700);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-[26px] left-1/2 z-[300] -translate-x-1/2 animate-[fadeUp_0.25s_ease_both] rounded-[11px] bg-sidebar px-5 py-[11px] text-[13.5px] font-medium text-white shadow-[0_8px_28px_rgba(0,0,0,0.28)]">
      {message}
    </div>
  );
}

export function useToast() {
  return {
    show(message: string, setToast: (m: string | null) => void) {
      setToast(message);
    },
  };
}
