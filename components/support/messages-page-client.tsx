"use client";

import {
  SUPPORT_CATEGORY_LABEL,
  SUPPORT_STATUS_LABEL,
  supportStatusTone,
} from "@/lib/support/constants";
import { markSupportTicketRead } from "@/lib/support/actions";
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

type MessagesPageProps = {
  tickets: SupportTicket[];
};

export function MessagesPageClient({ tickets }: MessagesPageProps) {
  const router = useRouter();
  const [selectedId, setSelectedId] = useState<string | null>(
    tickets[0]?.id ?? null
  );
  const [, startTransition] = useTransition();

  const selected = tickets.find((t) => t.id === selectedId) ?? null;

  useEffect(() => {
    if (!selected?.id) return;
    if ((selected.unreadAdminReplies ?? 0) === 0) return;

    startTransition(async () => {
      await markSupportTicketRead(selected.id);
      router.refresh();
    });
  }, [selected?.id, selected?.unreadAdminReplies, router]);

  return (
    <div className="scroll flex-1 overflow-auto">
      <div className="mx-auto max-w-[960px] px-12 pb-16 pt-[42px]">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="font-display text-[28px] font-semibold tracking-[-0.025em] text-ink">
              Help & support
            </h1>
            <p className="mt-2 max-w-[520px] text-[14.5px] text-muted">
              Your help requests and replies from the ResumeTrakr team.
            </p>
          </div>
        </div>

        {tickets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#D2D7DE] bg-[#FBFBFC] px-7 py-12 text-center">
            <div className="mb-2 text-[32px] opacity-55">✉</div>
            <div className="font-display text-[15px] font-semibold text-muted">
              No messages yet
            </div>
            <p className="mx-auto mt-2 max-w-[400px] text-[13.5px] text-muted">
              Tap <span className="font-semibold text-ink">Help me</span> in the
              lower-right corner to ask a question, request a feature, or ask
              about a human resume review.
            </p>
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
                      onClick={() => setSelectedId(ticket.id)}
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

                  {selected.status === "open" ? (
                    <p className="mt-5 rounded-lg border border-[#E8ECF1] bg-[#FAFBFC] px-3.5 py-3 text-[13px] text-muted">
                      We typically reply within 1–2 business days. Need to add
                      more detail? Send another message via{" "}
                      <span className="font-semibold text-ink">Help me</span>.
                    </p>
                  ) : null}
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
