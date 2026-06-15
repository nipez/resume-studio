import { MeshBackground } from "@/components/marketing/primitives";
import { ScaledResumePreview } from "@/components/resume/resume-preview";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { SAMPLE_RESUME_DATA } from "@/lib/resume/sample-data";
import { SITE_NAME, SITE_TAGLINE, SITE_TAGLINE_PRIMARY, SITE_TAGLINE_SECONDARY } from "@/lib/marketing/content";
import Link from "next/link";

const previewHtml = buildResumeHTML({
  templateStyle: "twocol",
  data: SAMPLE_RESUME_DATA,
});

const FLOATING_MODULES = [
  { label: "Tailor", top: "12%", left: "-8%" },
  { label: "Cover", top: "38%", left: "-12%" },
  { label: "Track", bottom: "28%", right: "-10%" },
];

export function MarketingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-[#152238] to-[#0a0c10]" />
      <MeshBackground dark />

      <div className="relative mx-auto max-w-6xl px-6 py-20 lg:py-28">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#AEB6C2] backdrop-blur-sm">
              <span className="h-1.5 w-1.5 animate-pulse-glow rounded-full bg-[#0E7C4B] shadow-[0_0_8px_#0E7C4B]" />
              {SITE_TAGLINE}
            </p>
            <h1 className="font-display text-[2.6rem] font-semibold leading-[1.06] tracking-[-0.035em] text-white sm:text-5xl lg:text-[3.55rem]">
              One system for your
              <br />
              <span className="bg-gradient-to-r from-[#7FA6FF] via-[#9B8AFF] to-[#B89DFF] bg-clip-text text-transparent">
                entire job search.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-[#AEB6C2] sm:text-[17px]">
              {SITE_TAGLINE_PRIMARY} {SITE_TAGLINE_SECONDARY} Library, tailor, cover
              letters, Q&amp;A, tracking, and insights — connected in one workspace.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-[11px] bg-accent px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_20px_rgba(47,107,255,0.45)] transition hover:bg-accent-dark hover:shadow-[0_6px_28px_rgba(47,107,255,0.55)]"
              >
                Get started free
              </Link>
              <Link
                href="/application-os"
                className="rounded-[11px] border border-white/15 bg-white/5 px-6 py-3.5 text-[14px] font-semibold text-white backdrop-blur-sm transition hover:border-white/25 hover:bg-white/10"
              >
                See the application OS →
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 pt-6">
              <p className="text-[12.5px] text-[#6E7686]">
                Not another PDF generator
              </p>
              <span className="hidden h-3 w-px bg-white/15 sm:block" />
              <p className="text-[12.5px] text-[#6E7686]">
                From $2.99/mo students
              </p>
              <span className="hidden h-3 w-px bg-white/15 sm:block" />
              <p className="text-[12.5px] text-[#6E7686]">
                $4.99 workspace without AI
              </p>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[420px] lg:mx-0 lg:max-w-none lg:justify-self-end">
            {FLOATING_MODULES.map((mod, i) => (
              <div
                key={mod.label}
                className={`absolute z-10 hidden rounded-lg border border-white/10 bg-sidebar/80 px-3 py-2 text-[11px] font-semibold text-[#7FA6FF] shadow-lg backdrop-blur-md lg:block ${i % 2 === 0 ? "animate-float" : "animate-float-delayed"}`}
                style={{
                  top: mod.top,
                  left: mod.left,
                  bottom: mod.bottom,
                  right: mod.right,
                }}
              >
                {mod.label}
              </div>
            ))}

            <div className="absolute -left-6 top-8 z-20 hidden rounded-xl border border-white/10 bg-sidebar/90 px-4 py-3 text-white shadow-xl backdrop-blur-md lg:block animate-float">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#7FA6FF]">
                Application OS
              </div>
              <div className="font-display text-2xl font-semibold">6 → 1</div>
              <div className="text-[11px] text-[#AEB6C2]">
                modules · one login
              </div>
            </div>
            <div className="absolute -right-4 bottom-12 z-20 hidden rounded-xl border border-[#CDEBD9] bg-[#EAF7F0] px-4 py-3 shadow-lg lg:block animate-float-delayed">
              <div className="text-[12px] font-bold text-[#0E7C4B]">
                ✓ Snapshot saved
              </div>
              <div className="text-[11px] text-[#5d7a69]">
                Resume + cover + Q&A frozen
              </div>
            </div>

            <div className="relative rounded-2xl border border-white/10 bg-white/5 p-3 shadow-[0_24px_64px_rgba(0,0,0,0.35)] backdrop-blur-sm">
              <div className="mb-2 flex items-center gap-1.5 px-1">
                <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                <span className="ml-2 text-[10px] font-medium text-[#6E7686]">
                  {SITE_NAME}
                </span>
              </div>
              <ScaledResumePreview
                html={previewHtml}
                title={`${SITE_NAME} preview`}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
