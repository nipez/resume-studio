"use client";

import { useState } from "react";

export function SignOutButton() {
  const [loading, setLoading] = useState(false);

  function handleSignOut() {
    setLoading(true);
    window.location.href = "/api/auth/logout";
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={loading}
      className="rounded-[11px] border border-white/10 bg-transparent px-4 py-2 text-[12.5px] font-semibold text-sidebar-nav transition hover:border-white/20 hover:text-white disabled:opacity-60"
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}
