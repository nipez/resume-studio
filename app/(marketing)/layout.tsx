import { BetaBanner } from "@/components/marketing/beta-banner";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import "@/components/marketing/shared/marketing-fonts.css";
import "@/components/marketing/shared/marketing-mobile.css";
import { getAuthUser } from "@/lib/auth";
import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function MarketingLayout({
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
