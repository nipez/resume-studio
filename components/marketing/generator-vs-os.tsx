import { SectionHeader } from "@/components/marketing/primitives";
import { GENERATOR_VS_OS } from "@/lib/marketing/content";

export function GeneratorVsOs() {
  return (
    <section className="relative border-y border-border bg-gradient-to-b from-page to-white py-20 sm:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Generators vs. application OS"
          title={
            <>
              Fast PDFs are fine for 5 jobs.
              <br />
              Serious searches need a system.
            </>
          }
          description="Credit-based AI generators (like resumestudio.ai) optimize a moment. Resume Studio optimizes the entire search — with versions, tracking, snapshots, and insights that compound over months."
        />

        <div className="mt-12 overflow-hidden rounded-2xl border border-border shadow-[0_12px_40px_rgba(15,17,22,0.06)]">
          <table className="w-full min-w-[640px] text-left text-[13.5px]">
            <thead>
              <tr className="bg-sidebar text-[12px] font-bold uppercase tracking-wider text-[#AEB6C2]">
                <th className="px-5 py-4">Dimension</th>
                <th className="px-5 py-4">AI resume generators</th>
                <th className="bg-accent/15 px-5 py-4 text-accent">
                  Resume Studio · Application OS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {GENERATOR_VS_OS.map((row, i) => (
                <tr
                  key={row.dimension}
                  className={`transition hover:bg-page/60 ${i % 2 === 0 ? "" : "bg-page/30"}`}
                >
                  <td className="px-5 py-4 font-semibold text-ink">
                    {row.dimension}
                  </td>
                  <td className="px-5 py-4 text-muted">{row.generator}</td>
                  <td className="bg-gradient-to-r from-[#F8FAFF] to-white px-5 py-4 font-medium text-ink">
                    <span className="mr-2 text-accent" aria-hidden>
                      ✓
                    </span>
                    {row.applicationOs}
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
