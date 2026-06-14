import { BETA_BANNER } from "@/lib/marketing/content";

export function BetaBanner() {
  return (
    <div className="relative overflow-hidden border-b border-accent/20 bg-gradient-to-r from-[#EEF3FF] via-[#F0F4FF] to-[#EEF3FF] px-4 py-2.5 text-center text-[13px] font-medium text-[#1E54E6]">
      <span className="relative z-10">{BETA_BANNER}</span>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,rgba(47,107,255,0.08),transparent_70%)]" />
    </div>
  );
}
