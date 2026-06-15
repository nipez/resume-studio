"use client";

import {
  createDemoUser,
  deleteDemoUser,
  viewAsDemoUser,
  type DemoUser,
} from "@/lib/admin/actions";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type AdminPanelProps = {
  demoUsers: DemoUser[];
  adminEmail: string;
};

export function AdminPanel({ demoUsers, adminEmail }: AdminPanelProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [label, setLabel] = useState("");
  const [makeStudent, setMakeStudent] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function handleCreate() {
    setError("");
    startTransition(async () => {
      try {
        await createDemoUser({
          label: label.trim() || "Demo student",
          makeStudent,
        });
        setLabel("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to create");
      }
    });
  }

  function handleOpenAs(id: string) {
    setError("");
    setBusyId(id);
    startTransition(async () => {
      try {
        await viewAsDemoUser(id);
        router.push("/library");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to open as user");
        setBusyId(null);
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this demo user and all their data?")) return;
    setBusyId(id);
    startTransition(async () => {
      try {
        await deleteDemoUser(id);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to delete");
      } finally {
        setBusyId(null);
      }
    });
  }

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[900px] px-12 pb-16 pt-[42px]">
        <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
          Admin · Demo users
        </h1>
        <p className="mt-2 max-w-[620px] text-[14.5px] leading-relaxed text-muted">
          Signed in as <span className="font-semibold text-ink">{adminEmail}</span>.
          Create lightweight demo personas (no extra email needed) and{" "}
          <span className="font-semibold text-ink">View as</span> them to walk
          through exactly what a new user would experience. Return to your own
          account anytime from the banner.
        </p>

        <div className="mt-7 rounded-2xl border border-border bg-white p-6">
          <h2 className="font-display text-[15px] font-semibold text-ink">
            Create a demo persona
          </h2>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <label className="flex flex-1 flex-col gap-1.5 text-xs font-semibold text-[#5A6573]">
              Label
              <input
                value={label}
                placeholder="e.g. High-school student"
                onChange={(e) => setLabel(e.target.value)}
                className="min-w-[220px] rounded-[10px] border border-[#DFE3E8] px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
              />
            </label>
            <label className="flex cursor-pointer items-center gap-2 pb-2.5 text-[13.5px] text-[#3a4350]">
              <input
                type="checkbox"
                checked={makeStudent}
                onChange={(e) => setMakeStudent(e.target.checked)}
                className="h-4 w-4 cursor-pointer accent-[#2F6BFF]"
              />
              Mark as student
            </label>
            <button
              type="button"
              disabled={pending}
              onClick={handleCreate}
              className="cursor-pointer rounded-[10px] border-none bg-accent px-5 py-2.5 text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] hover:bg-[#1E54E6] disabled:opacity-60"
            >
              {pending ? "Working…" : "Create persona"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-3 text-[13px] font-semibold text-[#B23B3B]">{error}</p>
        ) : null}

        <div className="mt-6 overflow-hidden rounded-2xl border border-border bg-white">
          <div className="grid grid-cols-[1fr_140px_160px] gap-3 border-b border-[#EEF0F3] bg-[#FAFBFC] px-6 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
            <div>Persona</div>
            <div>Created</div>
            <div className="text-right">Actions</div>
          </div>
          {demoUsers.length === 0 ? (
            <div className="px-6 py-10 text-center text-[13.5px] text-muted">
              No demo personas yet. Create one above to start.
            </div>
          ) : (
            demoUsers.map((u) => (
              <div
                key={u.id}
                className="grid grid-cols-[1fr_140px_160px] items-center gap-3 border-b border-[#F2F3F5] px-6 py-3.5 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-semibold text-ink">
                    {u.label}
                  </div>
                  <div className="truncate text-[12px] text-muted">{u.email}</div>
                </div>
                <div className="text-[12.5px] text-muted">
                  {new Date(u.created_at).toLocaleDateString()}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleOpenAs(u.id)}
                    className="cursor-pointer rounded-lg bg-sidebar px-3 py-[7px] text-xs font-semibold text-white transition-colors hover:bg-[#272b33] disabled:opacity-60"
                  >
                    {busyId === u.id ? "Opening…" : "View as"}
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => handleDelete(u.id)}
                    className="cursor-pointer rounded-lg border border-[#E0E3E8] bg-white px-2.5 py-[7px] text-xs text-[#B23B3B] transition-colors hover:border-[#E0A0A0] hover:bg-[#FFF6F6] disabled:opacity-60"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
