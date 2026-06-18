"use client";

import {
  DASHBOARD_VIEW_STORAGE_KEY,
  type DashboardHomeData,
  type DashboardView,
} from "@/components/dashboard/dashboard-shared";
import { DashboardHomeFull } from "@/components/dashboard/dashboard-home-full";
import { DashboardHomeSimple } from "@/components/dashboard/dashboard-home-simple";
import { useEffect, useState } from "react";

function readStoredView(): DashboardView {
  if (typeof window === "undefined") return "simple";
  const stored = window.localStorage.getItem(DASHBOARD_VIEW_STORAGE_KEY);
  return stored === "full" ? "full" : "simple";
}

function DashboardViewToggle({
  view,
  onChange,
}: {
  view: DashboardView;
  onChange: (view: DashboardView) => void;
}) {
  return (
    <div
      className="fixed bottom-6 right-6 z-40 flex items-center gap-1 rounded-full border border-[#E4E7EC] bg-white p-1 shadow-[0_8px_24px_rgba(15,17,22,0.12)]"
      role="group"
      aria-label="Dashboard view"
    >
      <button
        type="button"
        onClick={() => onChange("simple")}
        className={`cursor-pointer rounded-full border-none px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
          view === "simple"
            ? "bg-accent text-white"
            : "bg-transparent text-muted hover:text-ink"
        }`}
      >
        Simple
      </button>
      <button
        type="button"
        onClick={() => onChange("full")}
        className={`cursor-pointer rounded-full border-none px-3.5 py-2 text-[12.5px] font-semibold transition-colors ${
          view === "full"
            ? "bg-accent text-white"
            : "bg-transparent text-muted hover:text-ink"
        }`}
      >
        Full dashboard
      </button>
    </div>
  );
}

export function DashboardShell({ data }: { data: DashboardHomeData }) {
  const [view, setView] = useState<DashboardView>("simple");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setView(readStoredView());
    setReady(true);
  }, []);

  function handleChange(next: DashboardView) {
    setView(next);
    window.localStorage.setItem(DASHBOARD_VIEW_STORAGE_KEY, next);
  }

  if (!ready) {
    return <DashboardHomeSimple data={data} />;
  }

  return (
    <>
      {view === "simple" ? (
        <DashboardHomeSimple data={data} />
      ) : (
        <DashboardHomeFull data={data} />
      )}
      <DashboardViewToggle view={view} onChange={handleChange} />
    </>
  );
}
