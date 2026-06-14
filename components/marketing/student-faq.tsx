import { STUDENT_FAQ_ITEMS } from "@/lib/marketing/content";
import Link from "next/link";

export function StudentFaq() {
  return (
    <section className="border-t border-border bg-page">
      <div className="mx-auto max-w-6xl px-6 py-16 sm:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            Student FAQ
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            Quick answers for first-time resume builders. More on the{" "}
            <Link href="/faq" className="font-semibold text-accent hover:text-accent-dark">
              full FAQ page
            </Link>
            .
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-3xl divide-y divide-border rounded-2xl border border-border bg-white">
          {STUDENT_FAQ_ITEMS.map((item) => (
            <details key={item.question} className="group px-6 py-5">
              <summary className="cursor-pointer list-none font-display text-[16px] font-semibold text-ink marker:content-none">
                <span className="flex items-center justify-between gap-4">
                  {item.question}
                  <span className="text-accent transition group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-[14px] leading-relaxed text-muted">
                {item.answer}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
