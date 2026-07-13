"use client";

import { DisplayNameEditor } from "@/components/profile/display-name-editor";
import { Logo } from "@/components/brand/logo";
import { NavIcon } from "@/components/icons/nav-icons";
import { SignOutButton } from "@/components/sign-out-button";
import { HelpMeWidget } from "@/components/support/help-me-widget";
import { SupportInboxButton } from "@/components/support/support-inbox-button";
import { SITE_NAME } from "@/lib/marketing/content";
import { buildNavGroups, isNavItemActive } from "@/lib/shell/nav-config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const EXIT_VIEW_AS_HREF = "/api/admin/exit-view-as";

type AppShellProps = {
  children: React.ReactNode;
  userName: string;
  profileFullName: string | null;
  userEmail: string | null;
  positioning?: string | null;
  isAdmin?: boolean;
  isStudent?: boolean;
  hasResume?: boolean;
  impersonatingLabel?: string | null;
  supportUnreadCount?: number;
};

function ImpersonationBanner({ label }: { label: string }) {
  return (
    <div className="sticky top-0 z-[300] flex flex-none flex-wrap items-center justify-between gap-3 border-b border-[#FFB86A]/30 bg-[#231a2e] px-4 py-3 text-[13px] text-[#fbe9e3] shadow-[0_4px_20px_rgba(0,0,0,0.18)] sm:px-5">
      <span className="min-w-0">
        Viewing as <span className="font-semibold text-white">{label}</span>
      </span>
      <a
        href={EXIT_VIEW_AS_HREF}
        className="shrink-0 rounded-lg bg-[#FFB86A] px-4 py-2 text-[12.5px] font-bold text-[#231a2e] transition-colors hover:bg-[#ffc988]"
      >
        ← Back to Super admin
      </a>
    </div>
  );
}

function SidebarExitToSuperAdmin() {
  return (
    <div className="mb-3 px-1">
      <a
        href={EXIT_VIEW_AS_HREF}
        className="flex w-full items-center gap-2.5 rounded-[9px] border border-[#FFB86A]/35 bg-[#FFB86A]/15 px-2.5 py-2.5 text-left text-[13px] font-semibold text-[#FFE8CC] transition-colors hover:bg-[#FFB86A]/25"
      >
        <span className="flex h-[17px] w-[17px] items-center justify-center opacity-90">
          ←
        </span>
        <span>Back to Super admin</span>
      </a>
    </div>
  );
}

function FloatingExitToSuperAdmin() {
  return (
    <a
      href={EXIT_VIEW_AS_HREF}
      className="fixed bottom-4 left-4 right-4 z-[300] inline-flex items-center justify-center gap-2 rounded-full border border-[#FFB86A]/50 bg-[#231a2e] px-5 py-3 text-[14px] font-bold text-[#FFE8CC] shadow-[0_10px_32px_rgba(0,0,0,0.35)] transition-colors hover:bg-[#2d2238] sm:left-auto sm:right-6 sm:w-auto"
    >
      <span aria-hidden>←</span>
      Back to Super admin
    </a>
  );
}

export function AppShell({
  children,
  userName,
  profileFullName,
  userEmail,
  positioning,
  isAdmin = false,
  isStudent = false,
  hasResume = false,
  impersonatingLabel = null,
  supportUnreadCount = 0,
}: AppShellProps) {
  const pathname = usePathname();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const navGroups = useMemo(
    () => buildNavGroups({ isStudent, hasResume }),
    [isStudent, hasResume]
  );

  // Close the drawer whenever navigation happens.
  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileNavOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen]);

  return (
    <div className="appshell flex h-screen w-screen overflow-hidden bg-page text-ink">
      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-[340] bg-black/50 md:hidden"
          aria-hidden
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}
      <aside
        className={`${
          mobileNavOpen ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-[350] flex w-[248px] flex-none flex-col border-r border-white/[0.06] bg-sidebar px-3 py-4 text-sidebar-muted transition-transform duration-200 md:static md:translate-x-0 md:transition-none`}
      >
        <div className="flex items-center gap-2.5 px-2 pb-4">
          <Logo
            size={34}
            className="shrink-0 shadow-[0_6px_16px_-6px_rgba(15,181,166,0.45)]"
          />
          <div className="min-w-0">
            <div className="truncate font-display text-[15px] font-semibold tracking-[-0.01em] text-white">
              {SITE_NAME}
            </div>
            <DisplayNameEditor
              displayName={userName}
              profileFullName={profileFullName}
              email={userEmail}
            />
            {isStudent ? (
              <span className="mt-1 inline-flex rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#c8d4f0]">
                Student
              </span>
            ) : null}
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-4 overflow-y-auto">
          {impersonatingLabel ? <SidebarExitToSuperAdmin /> : null}
          {navGroups.map((group) => (
            <div key={group.label || "home"}>
              {group.label ? (
                <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-sidebar-footer">
                  {group.label}
                </div>
              ) : null}
              <div className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isNavItemActive(pathname, item.href);
                  const isPrimaryStudentCta =
                    isStudent && item.href === "/tailor" && hasResume;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[13px] transition-[background,color] duration-150 ${
                        active
                          ? "bg-accent/18 font-semibold text-white"
                          : isPrimaryStudentCta
                            ? "bg-accent/12 font-semibold text-white hover:bg-accent/18"
                            : "font-medium text-sidebar-nav hover:bg-white/[0.04] hover:text-white"
                      }`}
                    >
                      <span className="flex h-[17px] w-[17px] items-center justify-center opacity-90">
                        <NavIcon name={item.icon} />
                      </span>
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          {isAdmin ? (
            <div>
              <div className="mb-1.5 px-2 text-[10px] font-bold uppercase tracking-[0.08em] text-sidebar-footer">
                Admin
              </div>
              <Link
                href="/admin"
                className={`flex w-full items-center gap-2.5 rounded-[9px] px-2.5 py-2 text-left text-[13px] transition-[background,color] duration-150 ${
                  isNavItemActive(pathname, "/admin")
                    ? "bg-accent/18 font-semibold text-white"
                    : "font-medium text-sidebar-nav hover:bg-white/[0.04] hover:text-white"
                }`}
              >
                <span className="flex h-[17px] w-[17px] items-center justify-center opacity-90">
                  <NavIcon name="chart" />
                </span>
                <span>Super admin</span>
              </Link>
            </div>
          ) : null}
        </nav>

        <div className="mt-3 border-t border-white/[0.07] pt-3">
          {positioning?.trim() ? (
            <p className="mb-2.5 line-clamp-2 px-2 text-[10.5px] leading-[1.5] text-sidebar-footer">
              {positioning.trim()}
            </p>
          ) : null}
          <div className="px-1">
            <SignOutButton />
          </div>
        </div>
      </aside>

      <main className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        {impersonatingLabel ? (
          <ImpersonationBanner label={impersonatingLabel} />
        ) : null}
        <div className="flex flex-none items-center justify-between gap-3 border-b border-[#ECEEF1] bg-white px-4 py-2.5 sm:px-6 md:justify-end">
          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[9px] border border-[#E2E5EA] bg-white text-ink hover:bg-[#F4F5F7] md:hidden"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex items-center gap-3">
            {impersonatingLabel ? (
              <a
                href={EXIT_VIEW_AS_HREF}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#FFB86A]/45 bg-[#FFF8F0] px-3 py-1.5 text-[12.5px] font-bold text-[#231a2e] transition-colors hover:bg-[#FFE8CC]"
              >
                <span aria-hidden>←</span>
                Super admin
              </a>
            ) : null}
            <SupportInboxButton unreadCount={supportUnreadCount} />
          </div>
        </div>
        <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
        {impersonatingLabel ? <FloatingExitToSuperAdmin /> : null}
        {!isAdmin || impersonatingLabel ? (
          <HelpMeWidget isStudent={isStudent} />
        ) : null}
      </main>
    </div>
  );
}
