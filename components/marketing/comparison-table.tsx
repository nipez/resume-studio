import { COMPETITOR_COMPARISON } from "@/lib/marketing/content";

function CellValue({ value }: { value: boolean | string }) {
  if (value === true) {
    return <span className="font-bold text-[#0E7C4B]">✓</span>;
  }
  if (value === false) {
    return <span className="text-[#B23B3B]">—</span>;
  }
  return <span className="text-[12px] font-medium text-muted">{value}</span>;
}

export function ComparisonTable() {
  return (
    <section className="border-y border-border bg-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink">
            How we compare
          </h2>
          <p className="mt-3 text-[15px] leading-relaxed text-muted">
            The application OS vs. the tools job seekers stitch together today.
            Feature-level view — not a paid placement.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[720px] text-left text-[13.5px]">
            <thead className="bg-page text-[12px] font-bold uppercase tracking-wider text-muted">
              <tr>
                <th className="px-5 py-4">Feature</th>
                <th className="px-5 py-4 text-accent">
                  Resume Studio · Application OS
                </th>
                <th className="px-5 py-4">Teal</th>
                <th className="px-5 py-4">Jobscan</th>
                <th className="px-5 py-4">Resume.io</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {COMPETITOR_COMPARISON.map((row) => (
                <tr key={row.feature} className="hover:bg-page/50">
                  <td className="px-5 py-4 font-medium text-ink">
                    {row.feature}
                  </td>
                  <td className="bg-[#F8FAFF] px-5 py-4">
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
