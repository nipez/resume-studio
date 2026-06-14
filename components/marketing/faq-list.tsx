import { FAQ_ITEMS } from "@/lib/marketing/content";

export function FaqList() {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-border overflow-hidden rounded-2xl border border-border bg-white shadow-[0_12px_40px_rgba(15,17,22,0.06)]">
      {FAQ_ITEMS.map((item, i) => (
        <details key={item.question} className="group px-6 py-5 transition hover:bg-page/50">
          <summary className="cursor-pointer list-none font-display text-[17px] font-semibold text-ink marker:content-none">
            <span className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-4">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#EEF3FF] font-display text-[13px] font-bold text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {item.question}
              </span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-accent transition group-open:rotate-45 group-open:border-accent/30 group-open:bg-[#EEF3FF]">
                +
              </span>
            </span>
          </summary>
          <p className="ml-12 mt-3 pb-2 text-[14px] leading-relaxed text-muted">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}
