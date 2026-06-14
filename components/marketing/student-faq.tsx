import { STUDENT_FAQ_ITEMS } from "@/lib/marketing/content";
import Link from "next/link";

export function StudentFaq() {
  return (
    <section className="border-t border-border bg-page">
      <div className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#D97706]">
            FAQ
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Student FAQ
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Quick answers for first-time resume builders. More on the{" "}
            <Link href="/faq" className="font-semibold text-accent hover:text-accent-dark">
              full FAQ page
            </Link>
            .
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-[#F59E0B]/15 bg-white shadow-[0_12px_40px_rgba(245,158,11,0.06)]">
          {STUDENT_FAQ_ITEMS.map((item, i) => (
            <details key={item.question} className="group px-6 py-5 transition hover:bg-[#FFFBF5]/50">
              <summary className="cursor-pointer list-none font-display text-[16px] font-semibold text-ink marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  <span className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#FEF3C7] text-[11px] font-bold text-[#D97706]">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {item.question}
                  </span>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-[#F59E0B]/20 text-[#D97706] transition group-open:rotate-45 group-open:bg-[#FEF3C7]">
                    +
                  </span>
                </span>
              </summary>
              <p className="ml-10 mt-3 pb-1 text-[14px] leading-relaxed text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
