import { BetaBanner } from "@/components/marketing/beta-banner";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingHeader } from "@/components/marketing/marketing-header";
import "@/components/marketing/shared/marketing-fonts.css";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
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
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="marketing-site min-h-screen overflow-x-clip bg-[#fbf6f2] font-sans text-[#231a2e] antialiased">
      <BetaBanner />
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  );
}
