"use client";

import { DisplayNameEditor } from "@/components/profile/display-name-editor";
import { Logo } from "@/components/brand/logo";
import { SignOutButton } from "@/components/sign-out-button";
import { HelpMeWidget } from "@/components/support/help-me-widget";
import { SupportInboxButton } from "@/components/support/support-inbox-button";
import { SITE_NAME } from "@/lib/marketing/content";
import {
  buildMoreNavItems,
  buildTopNavItems,
  isNavItemActive,
} from "@/lib/shell/nav-config";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
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
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const topNav = useMemo(
    () => buildTopNavItems({ isStudent, hasResume }),
    [isStudent, hasResume]
  );
  const moreNav = useMemo(
    () => buildMoreNavItems({ isStudent, hasResume, isAdmin }),
    [isStudent, hasResume, isAdmin]
  );

  useEffect(() => {
    setMobileNavOpen(false);
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!mobileNavOpen && !menuOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setMobileNavOpen(false);
        setMenuOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileNavOpen, menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onPointerDown(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    window.addEventListener("mousedown", onPointerDown);
    return () => window.removeEventListener("mousedown", onPointerDown);
  }, [menuOpen]);

  const initials = initialsFromName(profileFullName?.trim() || userName);

  return (
    <div className="appshell flex h-screen w-screen flex-col overflow-hidden bg-page text-ink">
      {impersonatingLabel ? (
        <ImpersonationBanner label={impersonatingLabel} />
      ) : null}

      <header className="relative z-[200] flex flex-none items-center gap-3 border-b border-border bg-white px-4 sm:px-6 lg:px-8">
        <div className="flex min-w-0 flex-1 items-center gap-6 lg:gap-8">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2.5 py-3.5 no-underline"
            aria-label={SITE_NAME}
          >
            <Logo size={30} className="shrink-0" />
            <span className="hidden font-display text-[15px] font-semibold tracking-[-0.02em] text-ink sm:inline">
              {SITE_NAME}
            </span>
          </Link>

          <nav className="hidden min-w-0 items-stretch gap-0.5 md:flex">
            {topNav.map((item) => {
              const active = isNavItemActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative inline-flex items-center whitespace-nowrap px-3 py-4 text-[13.5px] transition-colors ${
                    active
                      ? "font-semibold text-ink"
                      : "font-medium text-muted hover:text-ink"
                  }`}
                >
                  {item.label}
                  {active ? (
                    <span className="absolute inset-x-3 bottom-0 h-[2px] rounded-full bg-teal" />
                  ) : null}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          {impersonatingLabel ? (
            <a
              href={EXIT_VIEW_AS_HREF}
              className="hidden items-center gap-1.5 rounded-lg border border-[#FFB86A]/45 bg-[#FFF8F0] px-3 py-1.5 text-[12.5px] font-bold text-[#231a2e] transition-colors hover:bg-[#FFE8CC] sm:inline-flex"
            >
              <span aria-hidden>←</span>
              Super admin
            </a>
          ) : null}

          <SupportInboxButton unreadCount={supportUnreadCount} />

          <Link
            href="/pricing"
            className="hidden rounded-full bg-teal px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-teal-dark sm:inline-flex"
          >
            Upgrade
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-haspopup="menu"
              aria-label="Account menu"
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-[#2A3038] text-[12px] font-bold text-white transition-transform hover:scale-[1.03]"
            >
              {initials}
            </button>

            {menuOpen ? (
              <div
                role="menu"
                className="absolute right-0 top-[calc(100%+8px)] z-[220] w-[240px] rounded-2xl border border-border bg-white p-2 shadow-soft animate-[fadeUp_0.18s_ease]"
              >
                <div className="border-b border-[#F0F1F3] px-3 pb-3 pt-2">
                  <div className="truncate text-[13.5px] font-semibold text-ink">
                    {profileFullName?.trim() || userName}
                  </div>
                  {userEmail ? (
                    <div className="mt-0.5 truncate text-[12px] text-muted">
                      {userEmail}
                    </div>
                  ) : null}
                  {isStudent ? (
                    <span className="mt-2 inline-flex rounded-full bg-[#E8FBF8] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-teal-dark">
                      Student
                    </span>
                  ) : null}
                  <div className="mt-2">
                    <DisplayNameEditor
                      displayName={userName}
                      profileFullName={profileFullName}
                      email={userEmail}
                    />
                  </div>
                  {positioning?.trim() ? (
                    <p className="mt-2 line-clamp-2 text-[11.5px] leading-snug text-muted">
                      {positioning.trim()}
                    </p>
                  ) : null}
                </div>

                <div className="py-1">
                  {moreNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      role="menuitem"
                      className={`block rounded-lg px-3 py-2 text-[13px] no-underline transition-colors hover:bg-[#F4F5F7] ${
                        isNavItemActive(pathname, item.href)
                          ? "font-semibold text-accent"
                          : "font-medium text-[#3a4350]"
                      }`}
                    >
                      {item.label}
                    </Link>
                  ))}
                  <Link
                    href="/pricing"
                    role="menuitem"
                    className="block rounded-lg px-3 py-2 text-[13px] font-medium text-[#3a4350] no-underline transition-colors hover:bg-[#F4F5F7] sm:hidden"
                  >
                    Upgrade
                  </Link>
                </div>

                <div className="border-t border-[#F0F1F3] pt-1">
                  <SignOutButton variant="light" />
                </div>
              </div>
            ) : null}
          </div>

          <button
            type="button"
            onClick={() => setMobileNavOpen(true)}
            aria-label="Open navigation menu"
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-[9px] border border-border bg-white text-ink hover:bg-soft md:hidden"
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
        </div>
      </header>

      {mobileNavOpen ? (
        <div
          className="fixed inset-0 z-[340] bg-black/40 md:hidden"
          aria-hidden
          onClick={() => setMobileNavOpen(false)}
        />
      ) : null}

      <aside
        className={`${
          mobileNavOpen ? "translate-x-0" : "translate-x-full"
        } fixed inset-y-0 right-0 z-[350] flex w-[min(320px,88vw)] flex-col border-l border-border bg-white shadow-soft transition-transform duration-200 md:hidden`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-3.5">
          <span className="font-display text-[15px] font-semibold text-ink">
            Menu
          </span>
          <button
            type="button"
            onClick={() => setMobileNavOpen(false)}
            className="cursor-pointer rounded-lg border border-border px-2.5 py-1.5 text-[12.5px] font-semibold text-muted"
          >
            Close
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-3">
          {[...topNav, ...moreNav].map((item) => {
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={`m-${item.href}`}
                href={item.href}
                className={`flex items-center justify-between rounded-xl px-3 py-3 text-[14px] no-underline ${
                  active
                    ? "bg-[#E8FBF8] font-semibold text-teal-dark"
                    : "font-medium text-ink hover:bg-soft"
                }`}
              >
                {item.label}
                {active ? (
                  <span className="h-1.5 w-1.5 rounded-full bg-teal" />
                ) : null}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <Link
            href="/pricing"
            className="mb-2 flex w-full items-center justify-center rounded-full bg-teal px-4 py-2.5 text-[13.5px] font-semibold text-white"
          >
            Upgrade
          </Link>
          <SignOutButton variant="light" />
        </div>
      </aside>

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-page">
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
