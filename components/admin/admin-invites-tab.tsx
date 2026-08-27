"use client";

import {
  createInviteCode,
  revokeInviteCode,
} from "@/lib/admin/actions";
import type { InviteCodeRow } from "@/lib/auth/invite-codes";
import { SITE_URL } from "@/lib/marketing/content";
import { Toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type AdminInvitesTabProps = {
  codes: InviteCodeRow[];
  loadFailed?: boolean;
};

function signupLink(code: string) {
  return `${SITE_URL}/signup?code=${encodeURIComponent(code)}`;
}

function formatWhen(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function AdminInvitesTab({ codes, loadFailed = false }: AdminInvitesTabProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [filter, setFilter] = useState<"open" | "used" | "all">("open");

  const unusedCount = codes.filter((c) => !c.usedAt && !c.revokedAt).length;

  const visible = useMemo(() => {
    if (filter === "open") {
      return codes.filter((c) => !c.usedAt && !c.revokedAt);
    }
    if (filter === "used") {
      return codes.filter((c) => Boolean(c.usedAt) || Boolean(c.revokedAt));
    }
    return codes;
  }, [codes, filter]);

  function handleCreate() {
    setError("");
    startTransition(async () => {
      try {
        const code = await createInviteCode(note);
        setNote("");
        setToast(`Created ${code}`);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not create a code");
      }
    });
  }

  async function copyText(label: string, value: string) {
    try {
      await navigator.clipboard.writeText(value);
      setToast(`Copied ${label}`);
    } catch {
      setError("Could not copy — select the code manually");
    }
  }

  function handleRevoke(id: string) {
    setError("");
    startTransition(async () => {
      try {
        await revokeInviteCode(id);
        setToast("Invite revoked");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not revoke that code");
      }
    });
  }

  return (
    <div className="mt-4 space-y-4">
      <div className="rounded-2xl border border-border bg-white p-6">
        <h2 className="font-display text-[15px] font-semibold text-ink">
          Generate an invite
        </h2>
        <p className="mt-1.5 max-w-[640px] text-[13px] leading-relaxed text-muted">
          Each code unlocks one free beta account. Send the code or the signup
          link after someone reaches out.
        </p>
        <div className="mt-4 flex flex-col gap-2.5 sm:flex-row sm:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-1.5 text-[12px] font-semibold text-[#5A6573]">
            Who it&apos;s for (optional)
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={120}
              placeholder="e.g. Alex — Product/AI roles"
              className="rounded-[10px] border border-[#DFE3E8] px-3 py-2 text-[13px] font-normal text-ink focus:border-accent focus:outline-none"
            />
          </label>
          <button
            type="button"
            disabled={pending}
            onClick={handleCreate}
            className="cursor-pointer rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-accent-dark disabled:opacity-60"
          >
            {pending ? "Generating…" : "Generate code"}
          </button>
        </div>
        {error ? (
          <p className="mt-3 text-[13px] font-semibold text-[#B23B3B]">{error}</p>
        ) : null}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F3] px-6 py-4">
          <h2 className="font-display text-[15px] font-semibold text-ink">
            Invite codes
            {unusedCount > 0 ? (
              <span className="ml-2 text-[13px] font-medium text-muted">
                {unusedCount} unused
              </span>
            ) : null}
          </h2>
          <div className="flex gap-1 rounded-lg bg-[#FAFBFC] p-1">
            {(
              [
                ["open", "Unused"],
                ["used", "Used / revoked"],
                ["all", "All"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`cursor-pointer rounded-md px-2.5 py-1 text-[12px] font-semibold ${
                  filter === id
                    ? "bg-white text-ink shadow-[0_1px_3px_rgba(15,17,22,0.08)]"
                    : "text-muted hover:text-ink"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loadFailed ? (
          <p className="px-6 py-8 text-[13.5px] text-muted">
            Invite codes failed to load. Apply migration{" "}
            <code>0020_signup_invite_codes.sql</code> on Supabase and refresh.
          </p>
        ) : visible.length === 0 ? (
          <p className="px-6 py-8 text-[13.5px] text-muted">
            {filter === "open"
              ? "No unused codes. Generate one when someone asks to join."
              : "No codes in this list yet."}
          </p>
        ) : (
          <div className="divide-y divide-[#F0F1F3]">
            {visible.map((row) => {
              const open = !row.usedAt && !row.revokedAt;
              return (
                <div
                  key={row.id}
                  className="flex flex-col gap-3 px-6 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-[14px] font-semibold tracking-[0.04em] text-ink">
                        {row.code}
                      </code>
                      {open ? (
                        <span className="rounded-md bg-[#E8FBF8] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-teal-dark">
                          Unused
                        </span>
                      ) : row.revokedAt ? (
                        <span className="rounded-md bg-[#F1F3F6] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-[#6B7480]">
                          Revoked
                        </span>
                      ) : (
                        <span className="rounded-md bg-[#EEF3FF] px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.04em] text-[#1E54E6]">
                          Used
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[12.5px] text-muted">
                      {row.note ? `${row.note} · ` : null}
                      {open
                        ? `Created ${formatWhen(row.createdAt)}`
                        : row.usedAt
                          ? `Used ${formatWhen(row.usedAt)}${
                              row.usedByEmail ? ` · ${row.usedByEmail}` : ""
                            }`
                          : `Revoked ${formatWhen(row.revokedAt)}`}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {open ? (
                      <>
                        <button
                          type="button"
                          onClick={() => copyText("code", row.code)}
                          className="cursor-pointer rounded-lg border border-[#E0E3E8] bg-white px-3 py-1.5 text-[12px] font-semibold text-ink hover:bg-soft"
                        >
                          Copy code
                        </button>
                        <button
                          type="button"
                          onClick={() => copyText("signup link", signupLink(row.code))}
                          className="cursor-pointer rounded-lg border border-[#E0E3E8] bg-white px-3 py-1.5 text-[12px] font-semibold text-ink hover:bg-soft"
                        >
                          Copy signup link
                        </button>
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => handleRevoke(row.id)}
                          className="cursor-pointer rounded-lg border border-[#E0E3E8] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#B23B3B] hover:bg-[#FFF6F6] disabled:opacity-60"
                        >
                          Revoke
                        </button>
                      </>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}
