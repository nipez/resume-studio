"use client";

import {
  SUPPORT_CATEGORY_LABEL,
  SUPPORT_STATUS_LABEL,
  supportStatusTone,
} from "@/lib/support/constants";
import {
  addUserSupportMessage,
  markSupportTicketRead,
} from "@/lib/support/actions";
import { SupportComposeForm } from "@/components/support/support-compose-form";
import { Spinner } from "@/components/ui/spinner";
import type { SupportTicket } from "@/lib/support/types";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";

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

function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit() {
    setError("");
    startTransition(async () => {
      try {
        await addUserSupportMessage(ticketId, body);
        setBody("");
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Something went wrong");
      }
    });
  }

  return (
    <div className="mt-5 border-t border-[#EEF0F3] pt-4">
      <label className="flex flex-col gap-1.5 text-[12.5px] font-semibold text-[#5A6573]">
        Add a follow-up
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={3}
          placeholder="Add more detail or ask a follow-up question…"
          className="resize-y rounded-[10px] border border-[#DFE3E8] px-3 py-2.5 text-sm text-ink focus:border-accent focus:outline-none"
        />
      </label>
      {error ? (
        <p className="mt-2 text-[13px] font-semibold text-[#B23B3B]">{error}</p>
      ) : null}
      <div className="mt-3 flex justify-end">
        <button
          type="button"
          disabled={pending}
          onClick={handleSubmit}
          className="inline-flex items-center gap-2 rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#1E54E6] disabled:opacity-60"
        >
          {pending ? <Spinner /> : null}
          {pending ? "Sending…" : "Send follow-up"}
        </button>
      </div>
    </div>
  );
}

type MessagesPageProps = {
  tickets: SupportTicket[];
  isStudent?: boolean;
};

export function MessagesPageClient({
  tickets,
  isStudent = false,
}: MessagesPageProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    tickets[0]?.id ?? null
  );
  const [composingNew, setComposingNew] = useState(tickets.length === 0);
  const [, startTransition] = useTransition();

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    if (tickets.length === 0) {
      setComposingNew(true);
      setSelectedId(null);
      return;
    }
    if (!selectedId || !tickets.some((t) => t.id === selectedId)) {
      setSelectedId(tickets[0]?.id ?? null);
    }
  }, [tickets, selectedId]);

  useEffect(() => {
    if (!selected?.id) return;
    if ((selected.unreadAdminReplies ?? 0) === 0) return;

    startTransition(async () => {
      await markSupportTicketRead(selected.id);
      router.refresh();
    });
  }, [selected?.id, selected?.unreadAdminReplies, router]);

  function handleNewTicketSuccess() {
    setComposingNew(false);
    router.refresh();
  }

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[960px] px-5 pb-16 sm:px-8 lg:px-12 pt-[42px]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
              Help & support
            </h1>
            <p className="mt-2 max-w-[520px] text-[14.5px] text-muted">
              Send us a question, feature idea, or review request — and read
              replies from the ResumeTrakr team here.
            </p>
          </div>
          {tickets.length > 0 ? (
            <button
              type="button"
              onClick={() => {
                setComposingNew(true);
                setSelectedId(null);
              }}
              className="inline-flex items-center gap-1.5 rounded-[11px] bg-accent px-[17px] py-[11px] text-[13.5px] font-semibold text-white shadow-[0_4px_14px_rgba(47,107,255,0.32)] transition-colors hover:bg-[#1E54E6]"
            >
              + New request
            </button>
          ) : null}
        </div>

        {tickets.length === 0 || composingNew ? (
          <div className="rounded-2xl border border-border bg-white p-6">
            <div className="mb-5 border-b border-[#EEF0F3] pb-4">
              <h2 className="font-display text-[17px] font-semibold text-ink">
                {tickets.length === 0 ? "Send us a message" : "New request"}
              </h2>
              <p className="mt-1 text-[13px] text-muted">
                {isStudent
                  ? "Ask a question, suggest a feature, or request a human resume review."
                  : "Ask a question or tell us what to build next."}
              </p>
            </div>
            <SupportComposeForm
              isStudent={isStudent}
              onSuccess={handleNewTicketSuccess}
            />
            {tickets.length > 0 ? (
              <div className="mt-4 border-t border-[#EEF0F3] pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setComposingNew(false);
                    setSelectedId(tickets[0]?.id ?? null);
                  }}
                  className="cursor-pointer border-none bg-transparent p-0 text-[13px] font-semibold text-accent hover:underline"
                >
                  ← Back to your requests
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <aside className="overflow-hidden rounded-2xl border border-border bg-white">
              <div className="border-b border-[#EEF0F3] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A92A0]">
                Your requests
              </div>
              <div className="max-h-[520px] overflow-auto">
                {tickets.map((ticket) => {
                  const tone = supportStatusTone(ticket.status);
                  const active = ticket.id === selectedId;
                  return (
                    <button
                      key={ticket.id}
                      type="button"
                      onClick={() => {
                        setSelectedId(ticket.id);
                        setComposingNew(false);
                      }}
                      className={`flex w-full cursor-pointer flex-col gap-1 border-b border-[#F2F3F5] px-4 py-3.5 text-left last:border-b-0 ${
                        active ? "bg-[#F5F8FF]" : "bg-white hover:bg-[#FAFBFC]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-semibold text-ink">
                          {SUPPORT_CATEGORY_LABEL[ticket.category]}
                        </span>
                        {(ticket.unreadAdminReplies ?? 0) > 0 ? (
                          <span className="rounded-full bg-[#B23B3B] px-1.5 py-0.5 text-[10px] font-bold text-white">
                            New
                          </span>
                        ) : null}
                      </div>
                      <span className="line-clamp-2 text-[12px] text-muted">
                        {ticket.message}
                      </span>
                      <span
                        className="mt-0.5 inline-flex w-fit rounded-md border px-2 py-0.5 text-[10px] font-bold"
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
            </aside>

            <section className="rounded-2xl border border-border bg-white p-6">
              {selected ? (
                <>
                  <div className="mb-5 border-b border-[#EEF0F3] pb-4">
                    <h2 className="font-display text-[17px] font-semibold text-ink">
                      {SUPPORT_CATEGORY_LABEL[selected.category]}
                    </h2>
                    <p className="mt-1 text-[12.5px] text-muted">
                      Opened {formatWhen(selected.created_at)}
                    </p>
                  </div>

                  <div className="space-y-4">
                    {(selected.messages ?? []).map((msg) => {
                      const isAdmin = msg.sender_role === "admin";
                      return (
                        <div
                          key={msg.id}
                          className={`rounded-xl border px-4 py-3 ${
                            isAdmin
                              ? "border-[#C8D8FF] bg-[#F5F8FF]"
                              : "border-[#EEF0F3] bg-[#FAFBFC]"
                          }`}
                        >
                          <div className="mb-1.5 flex items-center justify-between gap-2">
                            <span className="text-[11px] font-bold uppercase tracking-wide text-[#8A92A0]">
                              {isAdmin ? "ResumeTrakr team" : "You"}
                            </span>
                            <span className="text-[11px] text-muted">
                              {formatWhen(msg.created_at)}
                            </span>
                          </div>
                          <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
                            {msg.body}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {selected.status === "closed" ? (
                    <p className="mt-5 rounded-lg border border-[#E8ECF1] bg-[#FAFBFC] px-3.5 py-3 text-[13px] text-muted">
                      This request is closed. Use{" "}
                      <button
                        type="button"
                        onClick={() => {
                          setComposingNew(true);
                          setSelectedId(null);
                        }}
                        className="cursor-pointer border-none bg-transparent p-0 font-semibold text-accent hover:underline"
                      >
                        New request
                      </button>{" "}
                      if you need more help.
                    </p>
                  ) : (
                    <>
                      <p className="mt-5 text-[12.5px] text-muted">
                        We typically reply within 1–2 business days.
                      </p>
                      <TicketReplyForm ticketId={selected.id} />
                    </>
                  )}
                </>
              ) : (
                <p className="text-[13.5px] text-muted">
                  Select a conversation to read the thread.
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
