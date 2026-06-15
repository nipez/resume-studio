"use client";

import { Logo } from "@/components/brand/logo";
import { NavIcon, type NavIconName } from "@/components/icons/nav-icons";
import { SignOutButton } from "@/components/sign-out-button";
import { SITE_NAME } from "@/lib/marketing/content";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS: { href: string; label: string; icon: NavIconName }[] = [
  { href: "/library", label: "Resume Library", icon: "library" },
  { href: "/tailor", label: "Tailor to a Job", icon: "target" },
  { href: "/cover", label: "Cover Letter", icon: "mail" },
  { href: "/questions", label: "Application Q&A", icon: "chat" },
  { href: "/applications", label: "Applications", icon: "briefcase" },
  { href: "/insights", label: "Insights", icon: "chart" },
];

type AppShellProps = {
  children: React.ReactNode;
  userName: string;
  positioning?: string | null;
};

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/library") {
    return (
      pathname === "/library" ||
      pathname.startsWith("/library/") ||
      pathname.startsWith("/editor/")
    );
  }
  if (href === "/applications") {
    return (
      pathname === "/applications" || pathname.startsWith("/applications/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({
  children,
  userName,
  positioning,
}: AppShellProps) {
  const pathname = usePathname();

  return (
    <div className="appshell flex h-screen w-screen overflow-hidden bg-page text-ink">
      <aside className="flex w-[264px] flex-none flex-col bg-sidebar px-3.5 py-5 text-sidebar-muted">
        <div className="flex items-center gap-[11px] px-2 pb-[22px]">
          <Logo
            size={36}
            className="shrink-0 shadow-[0_4px_14px_rgba(47,107,255,0.4)]"
          />
          <div>
            <div className="font-display text-[15.5px] font-semibold tracking-[-0.01em] text-white">
              {SITE_NAME}
            </div>
            <div className="mt-px text-[11.5px] text-sidebar-subtle">
              {userName}
            </div>
          </div>
        </div>

        <nav className="flex flex-col gap-[3px]">
          {NAV_ITEMS.map((item) => {
            const active = isNavActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex w-full items-center gap-[11px] rounded-[10px] px-3 py-2.5 text-left text-[13.5px] transition-[background,color] duration-150 ${
                  active
                    ? "bg-accent/18 font-semibold text-white"
                    : "font-medium text-sidebar-nav hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span className="flex h-[18px] w-[18px] items-center justify-center">
                  <NavIcon name={item.icon} />
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/[0.07] pt-3.5">
          <p className="px-2 text-[11px] leading-[1.55] text-sidebar-footer">
            {positioning?.trim() ||
              "Add positioning notes to your profile to guide AI drafts in your voice."}
          </p>
          <div className="mt-3 px-2">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">{children}</main>
    </div>
  );
}
