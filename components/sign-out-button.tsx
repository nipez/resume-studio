"use client";

import { useState } from "react";

export function SignOutButton({
  variant = "dark",
  className = "",
}: {
  variant?: "dark" | "light";
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  function handleSignOut() {
    setLoading(true);
    window.location.href = "/api/auth/logout";
  }

  const styles =
    variant === "light"
      ? "w-full rounded-lg border-none bg-transparent px-3 py-2 text-left text-[13px] font-medium text-[#3a4350] transition hover:bg-[#F4F5F7] disabled:opacity-60"
      : "rounded-[11px] border border-white/10 bg-transparent px-4 py-2 text-[12.5px] font-semibold text-sidebar-nav transition hover:border-white/20 hover:text-white disabled:opacity-60";

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className={`${styles} ${className}`.trim()}
    >
      {loading ? "Signing out…" : "Log out"}
    </button>
  );
}
