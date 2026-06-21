import { BetaBanner } from "@/components/marketing/beta-banner";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

import "@/components/marketing/shared/marketing-fonts.css";
import "@/components/marketing/shared/marketing-mobile.css";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="marketing-site min-h-screen bg-[#fbf6f2] font-sans text-[#231a2e] antialiased">
      <BetaBanner />
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
