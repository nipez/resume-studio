export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-page px-6">
      <div className="flex max-w-lg flex-col items-center text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-[#7A53FF] font-display text-xl font-bold text-white shadow-accent">
          R
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-ink">
          Resume Studio
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted">
          AI-assisted resumes and job applications — scaffold deployed.
          Feature build starts in PR #2.
        </p>
        <p className="mt-8 rounded-lg border border-border bg-white px-4 py-3 text-sm text-muted">
          Health check:{" "}
          <a
            href="/api/health"
            className="font-semibold text-accent hover:text-accent-dark"
          >
            /api/health
          </a>
        </p>
      </div>
    </main>
  );
}
