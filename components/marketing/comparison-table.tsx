import { SectionHeader } from "@/components/marketing/primitives";
import { COMPETITOR_COMPARISON, SITE_NAME } from "@/lib/marketing/content";

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[#EAF7F0] text-[13px] font-bold text-[#0E7C4B]">
        ✓
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-page text-[13px] text-[#B23B3B]">
        —
      </span>
    );
  }
  return <span className="text-[12px] font-medium text-muted">{value}</span>;
}

export function ComparisonTable() {
  return (
    <section className="border-y border-border bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Social proof"
          title="How we compare"
          description="The application OS vs. the tools job seekers stitch together today. Feature-level view — not a paid placement."
        />

        <div className="mt-12 overflow-hidden rounded-2xl border border-border shadow-[0_12px_40px_rgba(15,17,22,0.06)]">
          <table className="w-full min-w-[720px] text-left text-[13.5px]">
            <thead>
              <tr className="bg-page text-[12px] font-bold uppercase tracking-wider text-muted">
                <th className="px-5 py-4">Feature</th>
                <th className="bg-accent/10 px-5 py-4 text-accent">
                  {SITE_NAME} · Application OS
                </th>
                <th className="px-5 py-4">Teal</th>
                <th className="px-5 py-4">Jobscan</th>
                <th className="px-5 py-4">Resume.io</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {COMPETITOR_COMPARISON.map((row) => (
                <tr key={row.feature} className="transition hover:bg-page/50">
                  <td className="px-5 py-4 font-medium text-ink">
                    {row.feature}
                  </td>
                  <td className="bg-gradient-to-r from-[#F8FAFF]/80 to-white px-5 py-4">
                    <CellValue value={row.studio} />
                  </td>
                  <td className="px-5 py-4">
                    <CellValue value={row.teal} />
                  </td>
                  <td className="px-5 py-4">
                    <CellValue value={row.jobscan} />
                  </td>
                  <td className="px-5 py-4">
                    <CellValue value={row.resumeio} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
