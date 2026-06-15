import { BETA_BANNER } from "@/lib/marketing/content";

export function BetaBanner() {
  const [lead, rest] = BETA_BANNER.split(" — ", 2);

  return (
    <div className="border-b border-white/10 bg-[#231a2e] px-4 py-2.5 text-center text-[13px] font-medium leading-snug text-[#fbe9e3] sm:text-[13px]">
      <p className="sm:hidden">
        <b className="font-semibold text-[#ff8a5c]">{lead}</b>
        {rest ? (
          <>
            <br />
            <span className="text-[12px] text-[#e8d5cf]">{rest}</span>
          </>
        ) : null}
      </p>
      <p className="hidden sm:block">
        <b className="font-semibold text-[#ff8a5c]">{lead}</b>
        {rest ? ` — ${rest}` : null}
      </p>
    </div>
  );
}
