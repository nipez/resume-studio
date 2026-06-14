import { BETA_BANNER } from "@/lib/marketing/content";

export function BetaBanner() {
  return (
    <div className="border-b border-accent/20 bg-[#EEF3FF] px-4 py-2.5 text-center text-[13px] font-medium text-[#1E54E6]">
      {BETA_BANNER}
    </div>
  );
}
