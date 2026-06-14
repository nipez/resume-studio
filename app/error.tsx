"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-page px-6">
      <div className="max-w-md rounded-2xl border border-border bg-white p-8 text-center">
        <h1 className="font-display text-xl font-semibold text-ink">
          Something went wrong
        </h1>
        <p className="mt-2 text-sm text-muted">{error.message}</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 rounded-[11px] bg-accent px-4 py-2.5 text-sm font-semibold text-white hover:bg-accent-dark"
        >
          Try again
        </button>
      </div>
    </main>
  );
}
