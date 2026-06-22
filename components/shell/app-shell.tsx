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
import { useMemo } from "react";

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
    <div className="flex flex-none flex-wrap items-center justify-between gap-3 bg-[#231a2e] px-5 py-2.5 text-[13px] text-[#fbe9e3]">
      <span>
        Viewing as <span className="font-semibold text-white">{label}</span> —
        you&apos;re seeing the app as this user.
      </span>
      <a
        href={EXIT_VIEW_AS_HREF}
        className="rounded-lg bg-white px-3 py-1.5 text-[12.5px] font-semibold text-[#231a2e] transition-colors hover:bg-[#f0f0f0]"
      >
        Back to Super admin
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
      className="fixed bottom-6 left-[268px] z-[100] inline-flex items-center gap-2 rounded-full border border-[#FFB86A]/40 bg-[#231a2e] px-4 py-2.5 text-[13px] font-semibold text-[#FFE8CC] shadow-[0_8px_28px_rgba(0,0,0,0.28)] transition-colors hover:bg-[#2d2238]"
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
  const navGroups = useMemo(
    () => buildNavGroups({ isStudent, hasResume }),
    [isStudent, hasResume]
  );

  return (
    <div className="appshell flex h-screen w-screen overflow-hidden bg-page text-ink">
      <aside className="flex w-[248px] flex-none flex-col border-r border-white/[0.06] bg-sidebar px-3 py-4 text-sidebar-muted">
        <div className="flex items-center gap-2.5 px-2 pb-4">
          <Logo
            size={34}
            className="shrink-0 shadow-[0_4px_14px_rgba(47,107,255,0.4)]"
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
        <div className="flex flex-none items-center justify-end border-b border-[#ECEEF1] bg-white px-6 py-2.5">
          <SupportInboxButton unreadCount={supportUnreadCount} />
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
