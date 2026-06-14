import { FAQ_ITEMS } from "@/lib/marketing/content";

export function FaqList() {
  return (
    <div className="mx-auto max-w-3xl divide-y divide-border rounded-2xl border border-border bg-white">
      {FAQ_ITEMS.map((item) => (
        <details key={item.question} className="group px-6 py-5">
          <summary className="cursor-pointer list-none font-display text-[17px] font-semibold text-ink marker:content-none">
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
  );
}
