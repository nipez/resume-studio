import { BETA_BANNER } from "@/lib/marketing/content";

export function BetaBanner() {
  const [lead, rest] = BETA_BANNER.split(" — ", 2);

  return (
    <div className="marketing-shell-pad border-b border-white/10 bg-[#231a2e] py-2.5 text-center text-[12px] font-medium leading-relaxed text-[#fbe9e3] sm:text-[13px]">
      <b className="font-semibold text-[#ff8a5c]">{lead}</b>
      {rest ? ` — ${rest}` : null}
    </div>
  );
}
