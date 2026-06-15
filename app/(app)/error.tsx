"use client";

import Link from "next/link";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isSchemaError =
    /job_url|hiring_contacts|schema cache|column/i.test(error.message);

  return (
    <div className="flex min-h-screen items-center justify-center bg-page px-6">
      <div className="max-w-md rounded-2xl border border-border bg-white p-8 text-center shadow-[0_12px_40px_rgba(15,17,22,0.08)]">
        <h1 className="font-display text-xl font-semibold text-ink">
          Something went wrong
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed text-muted">
          {isSchemaError
            ? "The database may need a quick update for application tracking (job URL and hiring contacts). Run migration 0002_application_metadata.sql in Supabase, then reload."
            : "We hit an unexpected error loading this page. Try again, or head back to your library."}
        </p>
        {error.digest ? (
          <p className="mt-2 text-[11px] text-[#9AA3AF]">Ref: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="rounded-[10px] bg-accent px-4 py-2.5 text-[13px] font-semibold text-white"
          >
            Try again
          </button>
          <Link
            href="/library"
            className="rounded-[10px] border border-border px-4 py-2.5 text-[13px] font-semibold text-ink"
          >
            Back to library
          </Link>
        </div>
      </div>
    </div>
  );
}
