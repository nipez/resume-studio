import { BetaBanner } from "@/components/marketing/beta-banner";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import { getAuthUser } from "@/lib/auth";

import "@/components/marketing/shared/marketing-fonts.css";
import "@/components/marketing/shared/marketing-mobile.css";

export default async function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  return (
    <div className="marketing-site min-h-screen bg-[#fbf6f2] font-sans text-[#231a2e] antialiased">
      <BetaBanner />
      <MarketingHeader signedIn={Boolean(user)} />
      {children}
      <MarketingFooter />
    </div>
  );
}
