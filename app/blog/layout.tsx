import { BetaBanner } from "@/components/marketing/beta-banner";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#fbf6f2] font-sans text-[#231a2e] antialiased">
      <BetaBanner />
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
