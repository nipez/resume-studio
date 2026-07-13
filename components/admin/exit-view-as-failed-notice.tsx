"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

/** Shows when /api/admin/exit-view-as could not restore the admin session. */
export function ExitViewAsFailedNotice() {
  const searchParams = useSearchParams();
  const [dismissed, setDismissed] = useState(false);

  if (searchParams.get("admin_exit_failed") !== "1" || dismissed) return null;

  return (
    <div className="mx-auto mb-0 mt-4 flex max-w-[1080px] flex-wrap items-center justify-between gap-3 rounded-xl border border-[#F2D2D2] bg-[#FCECEC] px-4 py-3 sm:mx-8 lg:mx-auto">
      <p className="text-[13px] font-semibold text-[#B23B3B]">
        Couldn&apos;t return to Super admin — your admin session may have expired. Sign
        out and sign back in with your admin account.
      </p>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        className="cursor-pointer rounded-lg border border-[#E0A0A0] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#B23B3B] hover:bg-[#FFF6F6]"
      >
        Dismiss
      </button>
    </div>
  );
}
