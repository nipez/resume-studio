import { ScaledResumePreview } from "@/components/resume/resume-preview";
import { buildResumeHTML } from "@/lib/resume/build-resume-html";
import { SAMPLE_RESUME_DATA } from "@/lib/resume/sample-data";
import Link from "next/link";

const previewHtml = buildResumeHTML({
  templateStyle: "twocol",
  data: SAMPLE_RESUME_DATA,
});

export function MarketingHero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-sidebar via-[#152238] to-[#0a0c10]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(47,107,255,0.35),transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_60%,rgba(122,83,255,0.18),transparent_45%)]" />
      <div className="absolute -right-20 top-20 h-72 w-72 rounded-full bg-accent/10 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#AEB6C2]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0E7C4B] shadow-[0_0_8px_#0E7C4B]" />
              Replace Teal + Jobscan + Google Docs
            </p>
            <h1 className="font-display text-[2.6rem] font-semibold leading-[1.06] tracking-[-0.035em] text-white sm:text-5xl lg:text-[3.55rem]">
              Stop guessing.
              <br />
              <span className="bg-gradient-to-r from-[#7FA6FF] to-[#B89DFF] bg-clip-text text-transparent">
                Start landing interviews.
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-[#AEB6C2] sm:text-[17px]">
              One workspace to build resume versions, tailor to each job, write
              cover letters, answer application questions, and track what you
              actually sent — so you know what&apos;s working.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/login"
                className="rounded-[11px] bg-accent px-6 py-3.5 text-[14px] font-semibold text-white shadow-[0_4px_20px_rgba(47,107,255,0.45)] transition hover:bg-accent-dark"
              >
                Get started free
              </Link>
              <Link
                href="/students"
                className="rounded-[11px] border border-white/15 bg-white/5 px-6 py-3.5 text-[14px] font-semibold text-white transition hover:bg-white/10"
              >
                I&apos;m a student
              </Link>
            </div>
            <p className="mt-5 text-[12.5px] text-[#6E7686]">
              From $2.99/mo for students · $4.99 workspace without AI · No
              trial traps
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-[400px] lg:mx-0 lg:max-w-none lg:justify-self-end">
            <div className="absolute -left-6 top-8 z-10 hidden rounded-xl border border-white/10 bg-sidebar/90 px-4 py-3 text-white shadow-xl backdrop-blur-md lg:block">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#7FA6FF]">
                Fit score
              </div>
              <div className="font-display text-2xl font-semibold">84</div>
              <div className="text-[11px] text-[#AEB6C2]">3 strengths · 1 gap</div>
            </div>
            <div className="absolute -right-4 bottom-12 z-10 hidden rounded-xl border border-[#CDEBD9] bg-[#EAF7F0] px-4 py-3 shadow-lg lg:block">
              <div className="text-[12px] font-bold text-[#0E7C4B]">
                ✓ Snapshot saved
              </div>
              <div className="text-[11px] text-[#5d7a69]">
                Resume + cover + Q&A frozen
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm">
              <ScaledResumePreview
                html={previewHtml}
                title="Resume Studio preview"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
