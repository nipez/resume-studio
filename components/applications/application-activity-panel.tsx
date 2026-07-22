"use client";

import {
  createApplicationNote,
  formatNoteTimestamp,
  parseApplicationNotes,
  serializeApplicationNotes,
  type ApplicationNote,
} from "@/lib/applications/notes";
import type { Application } from "@/lib/applications/types";
import { useMemo, useState } from "react";

type ApplicationActivityPanelProps = {
  app: Application;
  pending: boolean;
  patchLocal: (patch: Partial<Application>) => void;
  saveNotes: (notes: string) => void;
};

export function ApplicationActivityPanel({
  app,
  pending,
  patchLocal,
  saveNotes,
}: ApplicationActivityPanelProps) {
  const notes = useMemo(
    () => parseApplicationNotes(app.notes, app.applied_at),
    [app.notes, app.applied_at]
  );

  const [draft, setDraft] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBody, setEditBody] = useState("");

  function persist(next: ApplicationNote[]) {
    const serialized = serializeApplicationNotes(next);
    patchLocal({ notes: serialized });
    saveNotes(serialized);
  }

  function handleAdd() {
    const body = draft.trim();
    if (!body || pending) return;
    persist([...notes, createApplicationNote(body)]);
    setDraft("");
  }

  function startEdit(note: ApplicationNote) {
    setEditingId(note.id);
    setEditBody(note.body);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditBody("");
  }

  function saveEdit() {
    if (!editingId) return;
    const body = editBody.trim();
    if (!body) {
      persist(notes.filter((note) => note.id !== editingId));
    } else {
      persist(
        notes.map((note) =>
          note.id === editingId
            ? { ...note, body, updatedAt: new Date().toISOString() }
            : note
        )
      );
    }
    cancelEdit();
  }

  function removeNote(id: string) {
    persist(notes.filter((note) => note.id !== id));
    if (editingId === id) cancelEdit();
  }

  const chronological = [...notes].sort((a, b) =>
    a.createdAt.localeCompare(b.createdAt)
  );

  return (
    <aside className="flex min-h-[420px] flex-col overflow-hidden rounded-2xl border border-border bg-white lg:sticky lg:top-4 lg:max-h-[calc(100vh-5.5rem)]">
      <div className="flex-none border-b border-[#EEF0F3] px-4 py-3.5">
        <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.07em] text-[#8A92A0]">
          Activity
        </h2>
        <p className="mt-1 text-[12px] leading-snug text-[#9AA3AF]">
          Recruiter emails, call notes, and anything you want to remember.
        </p>
      </div>

      <div className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {chronological.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#E4E7EC] bg-[#FAFBFC] px-4 py-8 text-center">
            <p className="text-[13.5px] font-semibold text-ink">No notes yet</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-muted">
              Paste a recruiter message or jot what they said — it stays readable
              here instead of buried in a tiny field.
            </p>
          </div>
        ) : (
          chronological.map((note) => {
            const editing = editingId === note.id;
            return (
              <article
                key={note.id}
                className="rounded-xl border border-[#E8ECF1] bg-white px-3.5 py-3 shadow-[0_1px_0_rgba(15,17,22,0.03)]"
              >
                <div className="flex items-start gap-2.5">
                  <div
                    className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-full bg-[#EEF3FF] text-[11px] font-bold text-[#2456D6]"
                    aria-hidden
                  >
                    N
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                      <div className="text-[13px] font-semibold text-ink">Note</div>
                      <div className="text-[11.5px] text-[#9AA3AF]">
                        {formatNoteTimestamp(note.updatedAt || note.createdAt)}
                        {note.updatedAt ? " · edited" : ""}
                      </div>
                    </div>

                    {editing ? (
                      <div className="mt-2">
                        <textarea
                          value={editBody}
                          onChange={(e) => setEditBody(e.target.value)}
                          rows={6}
                          className="w-full resize-y rounded-[10px] border border-[#DFE3E8] px-3 py-2.5 text-[13.5px] leading-[1.65] text-[#1a1f29] focus:border-accent focus:outline-none"
                        />
                        <div className="mt-2 flex flex-wrap gap-2">
                          <button
                            type="button"
                            disabled={pending}
                            onClick={saveEdit}
                            className="cursor-pointer rounded-lg bg-accent px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="cursor-pointer rounded-lg border border-[#E4E7EC] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#5A6573] hover:bg-[#FAFBFC]"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="mt-2 whitespace-pre-wrap text-[13.8px] leading-[1.7] text-[#1a1f29]">
                          {note.body}
                        </p>
                        <div className="mt-2.5 flex gap-3">
                          <button
                            type="button"
                            onClick={() => startEdit(note)}
                            className="cursor-pointer border-none bg-transparent p-0 text-[12px] font-semibold text-[#2456D6] hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => removeNote(note.id)}
                            className="cursor-pointer border-none bg-transparent p-0 text-[12px] font-semibold text-[#B23B3B] hover:underline disabled:opacity-50"
                          >
                            Delete
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </article>
            );
          })
        )}
      </div>

      <div className="flex-none border-t border-[#EEF0F3] bg-[#FAFBFC] px-4 py-3">
        <label className="sr-only" htmlFor={`note-composer-${app.id}`}>
          Write a note
        </label>
        <textarea
          id={`note-composer-${app.id}`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          placeholder="Write a comment or paste a recruiter note…"
          className="w-full resize-none rounded-[10px] border border-[#DFE3E8] bg-white px-3 py-2.5 text-[13.5px] leading-[1.55] text-ink placeholder:text-[#9AA3AF] focus:border-accent focus:outline-none"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              handleAdd();
            }
          }}
        />
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-[#9AA3AF]">⌘/Ctrl + Enter to send</span>
          <button
            type="button"
            disabled={pending || !draft.trim()}
            onClick={handleAdd}
            className="cursor-pointer rounded-[9px] bg-accent px-3.5 py-2 text-[12.5px] font-semibold text-white hover:bg-accent-dark disabled:opacity-50"
          >
            Add note
          </button>
        </div>
      </div>
    </aside>
  );
}
