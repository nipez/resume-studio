import { GENERATOR_VS_OS } from "@/lib/marketing/content";

export function GeneratorVsOs() {
  return (
    <section className="bg-gradient-to-b from-page to-white py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">
            Generators vs. application OS
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
            Fast PDFs are fine for 5 jobs.
            <br />
            Serious searches need a system.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-muted">
            Credit-based AI generators (like resumestudio.ai) optimize a moment.
            Resume Studio optimizes the entire search — with versions, tracking,
            snapshots, and insights that compound over months.
          </p>
        </div>

        <div className="mt-10 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full min-w-[640px] text-left text-[13.5px]">
            <thead className="bg-sidebar text-[12px] font-bold uppercase tracking-wider text-[#AEB6C2]">
              <tr>
                <th className="px-5 py-4">Dimension</th>
                <th className="px-5 py-4">AI resume generators</th>
                <th className="bg-accent/10 px-5 py-4 text-accent">
                  Resume Studio · Application OS
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-white">
              {GENERATOR_VS_OS.map((row) => (
                <tr key={row.dimension} className="hover:bg-page/50">
                  <td className="px-5 py-4 font-semibold text-ink">
                    {row.dimension}
                  </td>
                  <td className="px-5 py-4 text-muted">{row.generator}</td>
                  <td className="bg-[#F8FAFF] px-5 py-4 font-medium text-ink">
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
