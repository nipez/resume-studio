"use client";

import {
  closeSupportTicket,
  replyToSupportTicket,
} from "@/lib/support/actions";
import {
  SUPPORT_CATEGORY_LABEL,
  SUPPORT_STATUS_LABEL,
  supportStatusTone,
} from "@/lib/support/constants";
import type { AdminSupportTicket } from "@/lib/support/types";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Toast } from "@/components/ui/toast";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type AdminSupportTabProps = {
  tickets: AdminSupportTicket[];
  /** Start view-as for the ticket's user (from the parent admin panel). */
  onViewAsUser?: (userId: string) => void;
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

export function AdminSupportTab({ tickets, onViewAsUser }: AdminSupportTabProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"open" | "replied" | "all">("open");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [closeTicketId, setCloseTicketId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let rows = tickets;
    if (filter === "open") {
      rows = rows.filter((t) => t.status === "open");
    } else if (filter === "replied") {
      rows = rows.filter((t) => t.status === "replied");
    }
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (t) =>
          t.userEmail.toLowerCase().includes(q) ||
          (t.userName?.toLowerCase().includes(q) ?? false) ||
          t.message.toLowerCase().includes(q)
      );
    }
    return rows;
  }, [tickets, filter, search]);

  const selected =
    filtered.find((t) => t.id === selectedId) ??
    filtered[0] ??
    null;

  function handleReply() {
    if (!selected) return;
    setError("");
    startTransition(async () => {
      try {
        await replyToSupportTicket(selected.id, reply);
        setReply("");
        setToast("Reply sent — user sees it in Messages");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to send reply");
      }
    });
  }

  function handleCloseConfirmed() {
    const ticketId = closeTicketId;
    if (!ticketId) return;
    startTransition(async () => {
      try {
        await closeSupportTicket(ticketId);
        setCloseTicketId(null);
        setToast("Ticket closed");
        router.refresh();
      } catch (e) {
        setCloseTicketId(null);
        setError(e instanceof Error ? e.message : "Failed to close ticket");
      }
    });
  }

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF0F3] px-6 py-4">
        <div>
          <h2 className="font-display text-[15px] font-semibold text-ink">
            Support inbox
          </h2>
          <p className="mt-1 text-[13px] text-muted">
            Reply to student and user help requests — they&apos;ll see it in Messages.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search email, name, or message…"
            className="min-w-[200px] rounded-[10px] border border-[#DFE3E8] px-3 py-1.5 text-[12.5px] focus:border-accent focus:outline-none"
          />
          <FilterChip active={filter === "open"} onClick={() => setFilter("open")}>
            Needs reply ({tickets.filter((t) => t.status === "open").length})
          </FilterChip>
          <FilterChip
            active={filter === "replied"}
            onClick={() => setFilter("replied")}
          >
            Waiting on user ({tickets.filter((t) => t.status === "replied").length})
          </FilterChip>
          <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
            All ({tickets.length})
          </FilterChip>
        </div>
      </div>

      {error ? (
        <p className="border-b border-[#EEF0F3] px-6 py-2 text-[13px] font-semibold text-[#B23B3B]">
          {error}
        </p>
      ) : null}

      {filtered.length === 0 ? (
        <div className="px-6 py-12 text-center text-[13.5px] text-muted">
          {search.trim()
            ? "No tickets match your search."
            : filter === "open"
              ? "No tickets need a reply — you're caught up."
              : filter === "replied"
                ? "No tickets waiting on a user response."
                : "No support tickets yet."}
        </div>
      ) : (
        <div className="grid lg:grid-cols-[300px_1fr]">
          <div className="max-h-[560px] overflow-auto border-b border-[#EEF0F3] lg:border-b-0 lg:border-r">
            {filtered.map((ticket) => {
              const tone = supportStatusTone(ticket.status);
              const active = selected?.id === ticket.id;
              return (
                <button
                  key={ticket.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(ticket.id);
                    setReply("");
                  }}
                  className={`flex w-full cursor-pointer flex-col gap-1 border-b border-[#F2F3F5] px-4 py-3.5 text-left last:border-b-0 ${
                    active ? "bg-[#F5F8FF]" : "hover:bg-[#FAFBFC]"
                  }`}
                >
                  <div className="truncate text-[13px] font-semibold text-ink">
                    {ticket.userName || ticket.userEmail}
                  </div>
                  <div className="text-[11px] text-muted">{ticket.userEmail}</div>
                  <div className="text-[12.5px] font-medium text-ink">
                    {SUPPORT_CATEGORY_LABEL[ticket.category]}
                  </div>
                  <div className="line-clamp-2 text-[12px] text-muted">
                    {ticket.message}
                  </div>
                  <span
                    className="mt-1 inline-flex w-fit rounded-md border px-2 py-0.5 text-[10px] font-bold"
                    style={{
                      background: tone.bg,
                      color: tone.fg,
                      borderColor: tone.bd,
                    }}
                  >
                    {SUPPORT_STATUS_LABEL[ticket.status]}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="p-6">
            {selected ? (
              <>
                <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-display text-[16px] font-semibold text-ink">
                      {SUPPORT_CATEGORY_LABEL[selected.category]}
                    </h3>
                    <p className="mt-1 text-[12.5px] text-muted">
                      {selected.userName || selected.userEmail} ·{" "}
                      {formatWhen(selected.created_at)}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {onViewAsUser ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => onViewAsUser(selected.user_id)}
                        title="Open the product as this user to reproduce their issue"
                        className="cursor-pointer rounded-lg bg-sidebar px-3 py-1.5 text-[12px] font-semibold text-white transition-colors hover:bg-[#272b33] disabled:opacity-60"
                      >
                        View as user
                      </button>
                    ) : null}
                    {selected.status !== "closed" ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => setCloseTicketId(selected.id)}
                        className="cursor-pointer rounded-lg border border-[#E0E3E8] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#5A6573] hover:border-[#C8CED6] disabled:opacity-60"
                      >
                        Close ticket
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="mb-5 max-h-[280px] space-y-3 overflow-auto">
                  {(selected.messages ?? []).map((msg) => {
                    const isAdmin = msg.sender_role === "admin";
                    return (
                      <div
                        key={msg.id}
                        className={`rounded-xl border px-4 py-3 ${
                          isAdmin
                            ? "border-[#CDEBD9] bg-[#EAF7F0]"
                            : "border-[#EEF0F3] bg-[#FAFBFC]"
                        }`}
                      >
                        <div className="mb-1 text-[11px] font-bold uppercase tracking-wide text-[#8A92A0]">
                          {isAdmin ? "You (admin)" : "User"}
                        </div>
                        <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
                          {msg.body}
                        </p>
                        <div className="mt-1 text-[11px] text-muted">
                          {formatWhen(msg.created_at)}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selected.status !== "closed" ? (
                  <div>
                    <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
                      Reply to user
                      <textarea
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        rows={4}
                        placeholder="Your reply appears in their Messages inbox…"
                        className="resize-y rounded-[10px] border border-[#DFE3E8] px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
                      />
                    </label>
                    <div className="mt-3 flex justify-end">
                      <button
                        type="button"
                        disabled={pending || !reply.trim()}
                        onClick={handleReply}
                        className="cursor-pointer rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-60"
                      >
                        {pending ? "Sending…" : "Send reply"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-muted">This ticket is closed.</p>
                )}
              </>
            ) : (
              <p className="text-[13px] text-muted">Select a ticket to reply.</p>
            )}
          </div>
        </div>
      )}

      <ConfirmDialog
        open={closeTicketId !== null}
        title="Close this ticket?"
        description="The user can still see the conversation in Messages, but the thread is marked resolved."
        confirmLabel="Close ticket"
        pending={pending}
        onConfirm={handleCloseConfirmed}
        onCancel={() => setCloseTicketId(null)}
      />
      {toast ? <Toast message={toast} onDone={() => setToast(null)} /> : null}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`cursor-pointer rounded-full border px-3 py-1.5 text-[12px] font-semibold transition-colors ${
        active
          ? "border-accent/30 bg-[#EEF3FF] text-accent"
          : "border-[#E2E5EA] bg-white text-muted hover:border-[#C8CED6]"
      }`}
    >
      {children}
    </button>
  );
}
